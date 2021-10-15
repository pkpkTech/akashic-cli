import * as React from "react";
import { observer } from "mobx-react";
import { ServiceType } from "@akashic/akashic-cli-commons/lib/ServiceType";
import { SandboxConfig } from "../../../common/types/SandboxConfig";
import { PlayEntity } from "../../store/PlayEntity";
import { DevtoolUiStore } from "../../store/DevtoolUiStore";
import { Operator } from "../../operator/Operator";
import { Devtool } from "../organism/Devtool";
import { LocalInstanceEntity } from "../../store/LocalInstanceEntity";

export interface DevtoolContainerProps {
	play: PlayEntity;
	operator: Operator;
	localInstance: LocalInstanceEntity;
	devtoolUiStore: DevtoolUiStore;
	sandboxConfig: SandboxConfig;
	targetService: ServiceType;
}

@observer
export class DevtoolContainer extends React.Component<DevtoolContainerProps, {}> {
	render(): React.ReactNode {
		const { play, operator, localInstance, devtoolUiStore, sandboxConfig, targetService } = this.props;
		return <Devtool
			height={devtoolUiStore.height}
			minHeight={200}
			onResizeHeight={operator.ui.setDevtoolHeight}
			activeDevtool={devtoolUiStore.activeDevtool as any /* TODO any 排除 */}
			onSelectDevtool={operator.ui.setActiveDevtool}
			eventsDevtoolProps={{
				showsEventList: devtoolUiStore.showsEventList,
				eventListWidth: devtoolUiStore.eventListWidth,
				eventListMinWidth: 150,
				onEventListResize: operator.ui.setEventListWidth,
				onClickShowEventList: operator.ui.setShowEventList,
				eventNames: sandboxConfig.events ? Object.keys(sandboxConfig.events) : [],
				eventEditContent: devtoolUiStore.eventEditContent,
				onClickSendEvent: operator.play.sendRegisteredEvent,
				onClickCopyEvent: operator.ui.copyRegisteredEventToEditor,
				onClickSendEditingEvent: operator.play.sendEditorEvent,
				onEventEditContentChanged: operator.ui.setEventEditContent
			}}
			instancesDevtoolProps={{
				instances: play.serverInstances.map(desc => ({
					type: "active" as ("active" | "passive"),
					env: `server (runnerId: ${desc.runnerId})`,
					playerId: null,
					name: null,
					isJoined: false
				})).concat(play.clientInstances.map(desc => ({
					type: (desc.isActive ? "active" : "passive") as ("active" | "passive"),
					env: desc.envInfo ? JSON.stringify(desc.envInfo) : null,
					playerId: desc.playerId,
					name: desc.name,
					isJoined: play.joinedPlayerTable.has(desc.playerId)
				}))),
				onClickAddInstance: operator.play.openNewClientInstance
			}}
			entityTreeDevtoolProps={{
				entityTrees: devtoolUiStore.entityTrees,
				entityTreeStateTable: devtoolUiStore.entityTreeStateTable,
				selectedEntityId: devtoolUiStore.selectedEntityId,
				isSelectingEntity: devtoolUiStore.isSelectingEntity,
				showsHidden: devtoolUiStore.showsHiddenEntity,
				onClickDump: operator.devtool.dumpSelectedEntity,
				onChangeShowsHidden: operator.devtool.toggleShowHiddenEntity,
				onClickSelectEntity: operator.devtool.startEntitySelection,
				onClickUpdateEntityTrees: operator.devtool.updateEntityTrees,
				onClickToggleOpenEntityChildren: operator.devtool.toggleOpenEntityTreeChildren,
				onClickEntityItem: operator.devtool.selectEntityByEDumpItem,
				onMouseOverEntityItem: operator.devtool.setHighlightedEntity,
				onMouseLeaveEntityItem: operator.devtool.clearHighlightedEntity
			}}
			atsumaruDevtoolProps={{
				disabled: targetService !== "atsumaru",
				volume: devtoolUiStore.volume,
				isSeekingVolume: devtoolUiStore.isSeekingVolume,
				changeVolume: operator.devtool.volumeChangeTo,
				dicideVolume: operator.devtool.volumeSeekTo
			}}
			niconicoDevtoolProps={{
				disabled: targetService === "atsumaru",
				isAutoSendEvent: devtoolUiStore.isAutoSendEvent,
				emulatingShinichibaMode: devtoolUiStore.emulatingShinichibaMode,
				totalTimeLimitInputValue: devtoolUiStore.totalTimeLimitInputValue,
				totalTimeLimit: devtoolUiStore.totalTimeLimit,
				playDuration: play.duration,
				usePreferredTimeLimit: devtoolUiStore.usePreferredTotalTimeLimit,
				stopsGameOnTimeout: devtoolUiStore.stopsGameOnTimeout,
				score: devtoolUiStore.score,
				playThreshold: devtoolUiStore.playThreshold,
				clearThreshold: devtoolUiStore.clearThreshold,
				preferredTotalTimeLimit: devtoolUiStore.preferredTotalTimeLimit,
				onAutoSendEventsChanged: operator.devtool.toggleAutoSendEvents,
				onModeSelectChanged: operator.devtool.setSupportedMode,
				onUsePreferredTotalTimeLimitChanged: operator.devtool.toggleUsePreferredTotalTimeLimit,
				onUseStopGameChanged: operator.devtool.toggleUseStopGame,
				onTotalTimeLimitInputValueChanged: operator.devtool.setTotalTimeLimitInputValue
			}}
			miscDevtoolProps={{
				downloadPlaylog: operator.play.downloadPlaylog
			}}
			playbackDevtoolProps={{
				startPointHeaders: play.startPointHeaders,
				selectedStartPointHeaderIndex: devtoolUiStore.selectedStartPointHeaderIndex,
				currentTime: (
					(localInstance.executionMode !== "replay") ? play.duration :
					(devtoolUiStore.isSeeking) ? devtoolUiStore.currentTimePreview : localInstance.targetTime
				),
				duration: play.duration,
				isPaused: localInstance.isPaused,
				isProgressActive: devtoolUiStore.isSeeking,
				isReplay: (localInstance.executionMode === "replay"),
				isActiveExists: true, // TODO
				isActivePaused: play.isActivePausing,
				isPauseOnSeek: devtoolUiStore.isPauseOnSeek,
				isForceJumpOnSeek: devtoolUiStore.isForceJumpOnSeek,
				onClickPauseActive:operator.play.togglePauseActive,
				onClickSavePlaylog: operator.play.downloadPlaylog,
				onClickPauseOnSeek: operator.devtool.togglePauseOnSeek,
				onClickForceJumpOnSeek: operator.devtool.toggleForceJumpOnSeek,
				onProgressChange: operator.localInstance.previewSeekTo,
				onProgressCommit: operator.localInstance.seekTo,
				onClickPause: operator.localInstance.togglePause,
				onClickFastForward: operator.localInstance.switchToRealtime,
				onClickJumpBySelectedStartPoint: operator.localInstance.resetBySelectedStartPoint,
				onClickDumpSelectedStartPoint: operator.devtool.dumpSelectedStartPoint,
				onClickStartPoint: operator.devtool.selectStartPointHeader,
				onDoubleClikStartPoint: operator.localInstance.resetByStartPointHeaderIndex
			}}
		/>;
	}
}
