import { action, observable } from "mobx";
import { ProfilerData, ProfilerName, ProfilerStyleSetting, ProfilerValueResult } from "../common/types/Profiler";

const PROFILER_DATA_LIMIT = 100; // １つのプロファイラが保持できるデータの個数。

export class ProfilerStore {
	@observable profilerDataArray: ProfilerData[];
	@observable profilerStyleSetting: ProfilerStyleSetting;

	constructor() {
		this.profilerDataArray = [
			{
				name: "fps",
				data: [],
				max: 0,
				min: Number.MAX_VALUE,
				fixed: 2
			},
			{
				name: "skipped",
				data: [],
				max: 0,
				min: Number.MAX_VALUE,
				fixed: 1
			},
			{
				name: "interval",
				data: [],
				max: 0,
				min: Number.MAX_VALUE,
				fixed: 1
			},
			{
				name: "frame",
				data: [],
				max: 0,
				min: Number.MAX_VALUE,
				fixed: 1
			},
			{
				name: "rendering",
				data: [],
				max: 0,
				min: Number.MAX_VALUE,
				fixed: 1
			}
		];
		// TODO: プロファイラーのサイズ・色等の設定値をserveに適したものにする
		this.profilerStyleSetting = {
			margin: 5,
			padding: 5,
			align: "horizontal",
			bgColor: "gray",
			fontColor: "white",
			fontSize: 17,
			fontMaxColor: "deeppink",
			fontMinColor: "dodgerblue",
			fontMinMaxColor: "black",
			graphColor: "lavender",
			graphWidth: 3,
			graphWidthMargin: 1,
			graphPadding: 5
		};
	}

	@action
	pushProfilerData (
		name: ProfilerName,
		profileValueResult: ProfilerValueResult
	) {
		const copiedProfilerDataArray = this.profilerDataArray.slice();
		// 本来であればArray#find()を使うべきだが、ES5にない関数なので代わりにfilterを使用する
		const targetProfilers = copiedProfilerDataArray.filter(profiler => profiler.name === name);
		if (targetProfilers.length === 0) {
			return;
		}
		const profilerData = targetProfilers[0];
		const currentValue = profileValueResult.ave;
		profilerData.data.unshift(currentValue);
		if (profilerData.data.length > PROFILER_DATA_LIMIT) {
			profilerData.data.pop();
		}
		if (currentValue < profilerData.min) {
			profilerData.min = currentValue;
		}
		if (profilerData.max < currentValue) {
			profilerData.max = currentValue;
		}
		this.profilerDataArray = copiedProfilerDataArray;
	}
}
