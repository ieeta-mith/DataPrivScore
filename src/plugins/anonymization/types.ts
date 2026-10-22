export type AnonymizationTechnique = 
	| 'generalization' | 'suppression' | 'masking' | 'hashing'
	| 'pseudonymization' | 'noise-addition' 
	| 'bucketing' | 'none-detected';
	
export type TechniqueKey = 
  | 'generalization' | 'suppression' | 'masking' | 'hashing'
  | 'pseudonymization' | 'noiseAddition'
  | 'bucketing';

export type TechniqueToggle = Record<TechniqueKey, boolean>;

export interface TechniqueDetectionConfig {
	minConfidence: number;
	generateRecommendations: boolean;
	enabledTechniques: TechniqueToggle;
};

export interface TechniqueEvidence {
	attribute: string;
	confidence: number;
	evidenceSamples: string[];
	reason: string;
};

export interface DetectedTechnique {
	technique: AnonymizationTechnique;
	affectedAttributes: string[];
	confidence: number;
	evidence: TechniqueEvidence[];
	description: string;
};

export interface TechniqueRecommendation {
	technique: AnonymizationTechnique;
	targetAttributes: string[];
	priority: 'critical' | 'high' | 'medium' | 'low';
	reason: string;
};

export interface TechniqueDetectionResult {
	detectedTechniques: DetectedTechnique[];
	unverifiedTechniques: string[];
	techniqueCoverage: number;
	protectedAttributeCount: number;
	totalAttributes: number;
	techniqueScore: number;
	recommendations: TechniqueRecommendation[];
}