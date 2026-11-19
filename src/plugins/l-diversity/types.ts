export type LDiversityType = 'distinct' | 'entropy' | 'recursive';

export interface LDiversityConfig {
	lThreshold: number;
	diversityType: LDiversityType;
	cValue: number;
}

export interface EquivalenceClassWithSensitive {
	id: string;
	quasiValues: string;
	size: number;
	sensitiveValues: string[];
}

export interface LDiversityClassResult {
	equivalenceClassId: string;
	distinctCount: number;
	entropy: number;
	satisfiesLDiversity: boolean;
	sensitiveValueDistribution: Record<string, number>;
}

export interface LDiversityResult {
	lValue: number;
	satisfiesLDiversity: boolean;
	lThreshold: number;
	diversityType: LDiversityType;
	classResults: LDiversityClassResult[];
	violatingClasses: string[];
	complianceRate: number;
	sensitiveAttributes: string[];
	averageEntropy: number;
}
