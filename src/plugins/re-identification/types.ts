export interface ExpectedUpstreamData {
	kValue: number;
	averageClassSize: number;
}

export type ReIdentificationRiskConfig = Record<string, never>;

export interface ReIdentificationRiskResult {
	prosecutorRisk: number;
	journalistRisk: number;
	marketerRisk: number;
	maxRisk: number;
	samplingFraction: number;
	score: number;
	kMin: number;
	kAvg: number;
}
