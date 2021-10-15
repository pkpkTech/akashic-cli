import { GetStartPointOptions } from "@akashic/amflow";
import { Store } from "../store/Store";

export class LocalInstanceOperator {
	private store: Store;

	constructor(store: Store) {
		this.store = store;
	}

	previewSeekTo = (time: number): void => {
		this.store.devtoolUiStore.previewSeekTo(time);
	}

	seekTo = (time: number): void => {
		this.store.currentLocalInstance.setExecutionMode("replay");
		this.store.currentLocalInstance.setTargetTime(time);
		this.store.devtoolUiStore.endPreviewSeek();
	}

	// TODO 削除
	// seekToStartPoint = (frame: number): void => {
	// 	this.store.currentLocalInstance.setExecutionMode("replay");
	// 	this.store.currentLocalInstance.setFrameWithStartPoint(frame, (targetTime) => {
	// 		this.store.devtoolUiStore.seekTo(targetTime);
	// 	});
	// }

	seekToStartPointOf = async (frame: number): Promise<void> => {
		await this.resetByNearestStartPointOf({ frame }, true);
	}

	resetByStartPointHeaderIndex = async (index: number): Promise<void> => {
		const sps = this.store.currentPlay.startPointHeaders;
		await this.resetByNearestStartPointOf({ frame: sps[index].frame }, true);
	}

	resetBySelectedStartPoint = async (): Promise<void> => {
		const index = this.store.devtoolUiStore.selectedStartPointHeaderIndex;
		await this.resetByStartPointHeaderIndex(index);
	}

	/**
	 * 条件にもっとも近いスタートポイントでローカルインスタンスをリセットする。
	 * toSeek が真なら、さらにリセットした時点にシークする。
	 * ローカルインスタンスがリセット可能でない (Akashic Engine v2 以前) 場合、何もしない。
	 */
	resetByNearestStartPointOf = async (opts: GetStartPointOptions, toSeek: boolean): Promise<void> => {
		if (!this.store.currentLocalInstance.isResettable)
			return;
		const amflow = this.store.currentLocalInstance.play.amflow;
		const sp = await amflow.getStartPointPromise(opts);
		this.store.currentLocalInstance.reset(sp);
		if (toSeek) {
			this.seekTo(sp.timestamp - amflow.getStartedAt());
		}
	}

	togglePause = (pause: boolean): void => {
		this.store.currentLocalInstance.togglePause(pause);
	}

	switchToRealtime = (): void => {
		this.store.currentLocalInstance.setExecutionMode("passive");
		this.store.currentLocalInstance.resume();
	}
}
