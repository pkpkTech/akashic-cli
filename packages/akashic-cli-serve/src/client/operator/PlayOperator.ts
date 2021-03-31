import * as Subscriber from "../api/Subscriber";
import { Store } from "../store/Store";

export class PlayOperator {
	private store: Store;

	constructor(store: Store) {
		this.store = store;
		Subscriber.onDisconnect.add(this.closeThisWindowIfNeeded);
	}

	togglePauseActive = (pauses: boolean): void => {
		if (pauses) {
			this.store.currentPlay.pauseActive();
		} else {
			this.store.currentPlay.resumeActive();
		}
	}

	step = (): void => {
		this.store.currentPlay.stepActive();
	}

	toggleJoinLeaveSelf = (toJoin: boolean): void => {
		const player = this.store.player;
		if (toJoin) {
			this.store.currentPlay.join(player.id, player.name);
		} else {
			this.store.currentPlay.leave(this.store.player.id);
		}
	}

	openNewClientInstance = (): void => {
		let restoreData;
		if (this.store.appOptions.experimentalOpen) {
			// localStorage から保存した window 情報を取得し、window の位置/サイズを復元して表示。
			// 取得した情報は localStorage から除去する。
			const name = "win_" + this.store.contentStore.defaultContent().gameName;
			const saveDataStr = localStorage.getItem(name);
			const saveDataAry = saveDataStr ? JSON.parse(saveDataStr) : [];
			restoreData = saveDataAry.shift();
			localStorage.setItem(name, JSON.stringify(saveDataAry));

			if (restoreData) {
				// screen サイズを超過している場合は window が表示されるように位置を調整
				if (screen.width <= restoreData.x) {
					restoreData.x = screen.width - restoreData.width;
				}
				if (screen.height <= restoreData.y) {
					restoreData.y = screen.height - restoreData.height;
				}
			}
		}

		const width = restoreData?.width || window.innerWidth;
		const height = restoreData?.height || window.innerHeight;
		const top = restoreData?.y || 0;
		const left = restoreData?.x || 0;
		// Mac Chrome で正しく動作しないのと、親ウィンドウかどうかの判別をしたいことがあるので noopener は付けない。
		// 代わりに ignoreSession を指定して自前でセッションストレージをウィンドウごとに使い分ける (ref. ../store/storage.ts)
		const win = window.open(
			`${window.location.pathname}?ignoreSession=1`,
			"_blank",
			`width=${width},height=${height},top=${top},left=${left}`
		);
		(win as any).isChildWin = true; // ここから開いた window は子 window としてフラグを付ける。
	}

	closeThisWindowIfNeeded = (): void => {
		if (this.store.appOptions.preserveDisconnected)  return;

		if (window.opener) {
			window.close();
		}
	}

	sendRegisteredEvent = (eventName: string): void => {
		const sandboxConfig = this.store.currentLocalInstance.content.sandboxConfig || {};
		const pevs = sandboxConfig.events[eventName];
		const amflow = this.store.currentPlay.amflow;
		pevs.forEach((pev: any) => amflow.enqueueEvent(pev));
	}

	sendEditorEvent = (): void => {
		// TODO: 入力された JSON が不正な値の場合に Send ボタンを disabled にし、このパスでは正常な値が取れるようにする。
		if (this.store.devtoolUiStore.eventEditContent.trim() === "")  return;
		let pevs;
		try {
			pevs = JSON.parse(this.store.devtoolUiStore.eventEditContent);
		} catch (e) {
			throw new Error(e);
		}
		const amflow = this.store.currentPlay.amflow;
		pevs.forEach((pev: any) => amflow.enqueueEvent(pev));
	}

	downloadPlaylog = (): void => {
		location.href = `/api/plays/${this.store.currentPlay.playId}/playlog`;
	}
}
