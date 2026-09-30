export interface TClosenessConfig {
	tThreshold: number;
}
export interface EquivalenceClassWithSensitiveValues {
  id: string;
  size: number;
  sensitiveValues: string[];
}

export interface TClosenessClassResult {
	equivalenceClassId: string;
	distance: number;
	satisfiesTCloseness: boolean;
	localDistribution: Record<string, number>;
}

export interface TClosenessResult {
	maxDistance: number;
	satisfiesTCloseness: boolean;
	tThreshold: number;
	classResults: TClosenessClassResult[];
	violatingClasses: string[];
	complianceRate: number;
	globalDistribution: Record<string, number>;
	sensitiveAttribute: string;
	averageDistance: number;
}

