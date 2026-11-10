export interface KAnonymityConfig {
	kThreshold: number;
}

export interface EquivalenceClass {
	id: string;
	quasiIdentifierValues: Record<string, string>;
	size: number;
	rowIndices: number[];
}

export interface KAnonymityResult {
	kValue: number;
	satisfiesKAnonymity: boolean;
	kThreshold: number;
	equivalenceClassCount: number;
	sizeDistribution: Record<number, number>;
	violatingClasses: EquivalenceClass[];
	complianceRate: number;
	averageClassSize: number;
	quasiIdentifiers: string[];
}