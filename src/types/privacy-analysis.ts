import type { ClassificationResult } from './attribute-classification';
import type { ParsedCSV } from './csv-parser';

// ============================================================================
// K-Anonymity Types
// ============================================================================

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

// ============================================================================
// L-Diversity Types
// ============================================================================

export type LDiversityType = 'distinct' | 'entropy' | 'recursive';

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

// ============================================================================
// T-Closeness Types
// ============================================================================

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

// ============================================================================
// Privacy Technique Detection Types
// ============================================================================

export type PrivacyTechnique = 
  | 'generalization'
  | 'suppression'
  | 'masking'
  | 'hashing'
  | 'pseudonymization'
  | 'tokenization'
  | 'noise-addition'
  | 'data-swapping'
  | 'aggregation'
  | 'bucketing'
  | 'none-detected';

export interface TechniqueEvidence {
  attribute: string;
  confidence: number;
  evidenceSamples: string[];
  reason: string;
}

export interface DetectedTechnique {
  technique: PrivacyTechnique;
  affectedAttributes: string[];
  confidence: number;
  evidence: TechniqueEvidence[];
  description: string;
  privacyBenefit: 'low' | 'medium' | 'high';
}

export interface TechniqueDetectionResult {
  detectedTechniques: DetectedTechnique[];
  techniqueCoverage: number;
  protectedAttributeCount: number;
  totalAttributes: number;
  techniqueScore: number;
  recommendations: TechniqueRecommendation[];
}

export interface TechniqueRecommendation {
  technique: PrivacyTechnique;
  targetAttributes: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

// ============================================================================
// Privacy Index Types
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface PrivacyMetricScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  status: 'pass' | 'warning' | 'fail';
  details: string;
}

export interface ReidentificationRisk {
  riskScore: number;
  riskLevel: RiskLevel;
  reidentificationProbability: number;
  riskFactors: RiskFactor[];
  prosecutorRisk: number;
  journalistRisk: number;
  marketerRisk: number;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
  mitigation: string;
}

export interface PrivacyIndexResult {
  overallScore: number;
  riskLevel: RiskLevel;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metricScores: PrivacyMetricScore[];
  pluginData: Record<string, unknown>;
  timestamp: Date;
  metadata: AnalysisMetadata;
  recommendations: PrivacyRecommendation[];
  riskFactors: RiskFactor[];
}

export interface AnalysisMetadata {
  recordCount: number;
  attributeCount: number;
  classificationSummary: {
    directIdentifiers: number;
    quasiIdentifiers: number;
    sensitiveAttributes: number;
    nonSensitiveAttributes: number;
  };
  analysisDuration: number;
  config: PrivacyAnalysisConfig;
}

export interface PrivacyRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'k-anonymity' | 'l-diversity' | 't-closeness' | 'technique' | 'general';
  title: string;
  description: string;
  expectedImpact: number;
  affectedAttributes: string[];
  action: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface MetricToggle {
  kAnonymity: boolean;
  lDiversity: boolean;
  tCloseness: boolean;
  techniqueDetection: boolean;
  reidentificationRisk: boolean;
}

export interface TechniqueToggle {
  generalization: boolean;
  suppression: boolean;
  masking: boolean;
  hashing: boolean;
  pseudonymization: boolean;
  tokenization: boolean;
  noiseAddition: boolean;
  dataSwapping: boolean;
  aggregation: boolean;
  bucketing: boolean;
}

export interface PrivacyAnalysisConfig {
  kThreshold: number;
  lThreshold: number;
  tThreshold: number;
  lDiversityType: LDiversityType;
  metricWeights: {
    kAnonymity: number;
    lDiversity: number;
    tCloseness: number;
    techniqueDetection: number;
    reidentificationRisk: number;
  };
  includeDetailedAnalysis: boolean;
  enabledMetrics: MetricToggle;
  enabledTechniques: TechniqueToggle;
}

export const METRIC_THRESHOLDS = {
  kAnonymity: {
    min: 2,
    max: 20,
    default: 5,
    label: 'K-Anonymity Threshold (k)',
    description: 'Minimum records with same quasi-identifier values',
    unit: 'records',
  },
  lDiversity: {
    min: 2,
    max: 10,
    default: 2,
    label: 'L-Diversity Threshold (l)',
    description: 'Minimum distinct sensitive values per group',
    unit: 'values',
  },
  tCloseness: {
    min: 0.01,
    max: 0.5,
    default: 0.3,
    label: 'T-Closeness Threshold (t)',
    description: 'Maximum distance between local and global distribution',
    unit: '',
  },
} as const;

export const METRIC_INFO = {
  kAnonymity: {
    name: 'K-Anonymity',
    shortDescription: 'Ensures each record is indistinguishable from at least k-1 other records',
    guidance: 'Higher k values provide stronger privacy but may reduce data utility. A value of 5 is commonly recommended.',
    warningLow: 'Values below 3 may not provide adequate privacy protection against re-identification attacks.',
    warningHigh: 'Values above 10 may significantly reduce data utility without proportional privacy gains.',
  },
  lDiversity: {
    name: 'L-Diversity',
    shortDescription: 'Ensures each equivalence class has at least l distinct sensitive values',
    guidance: 'Protects against attribute disclosure attacks. Higher values increase diversity requirements.',
    warningLow: 'Values below 2 offer minimal protection against attribute disclosure.',
    warningHigh: 'Values above 5 may be hard to achieve with limited sensitive value diversity.',
  },
  tCloseness: {
    name: 'T-Closeness',
    shortDescription: 'Limits the distribution difference between groups and overall dataset',
    guidance: 'Lower t values enforce stricter distribution similarity. Values between 0.15-0.35 are typical.',
    warningLow: 'Values below 0.15 may be too restrictive and hard to satisfy.',
    warningHigh: 'Values above 0.35 may allow significant distribution skew.',
  },
  techniqueDetection: {
    name: 'Technique Detection',
    shortDescription: 'Detects applied privacy-preserving techniques like masking, generalization, etc.',
    guidance: 'This metric analyzes data patterns to identify privacy techniques already applied.',
    warningLow: '',
    warningHigh: '',
  },
  reidentificationRisk: {
    name: 'Re-identification Risk',
    shortDescription: 'Estimates the probability of identifying individuals in the dataset',
    guidance: 'Combines multiple factors to assess overall re-identification vulnerability.',
    warningLow: '',
    warningHigh: '',
  },
} as const;

export const DEFAULT_METRIC_TOGGLE: MetricToggle = {
  kAnonymity: true,
  lDiversity: true,
  tCloseness: true,
  techniqueDetection: true,
  reidentificationRisk: true,
};

export const DEFAULT_TECHNIQUE_TOGGLE: TechniqueToggle = {
  generalization: true,
  suppression: true,
  masking: true,
  hashing: true,
  pseudonymization: true,
  tokenization: true,
  noiseAddition: true,
  dataSwapping: true,
  aggregation: true,
  bucketing: true,
};

export const TECHNIQUE_INFO = {
  generalization: {
    name: 'Generalization',
    description: 'Replaces specific values with broader categories (e.g., exact age → age range)',
    icon: 'Layers'
  },
  suppression: {
    name: 'Suppression',
    description: 'Removes or replaces sensitive values with placeholders (e.g., "*", "N/A")',
    icon: 'EyeOff'
  },
  masking: {
    name: 'Masking',
    description: 'Partially hides values while preserving some information (e.g., "***-**-1234")',
    icon: 'Mask'
  },
  hashing: {
    name: 'Hashing',
    description: 'Transforms values into fixed-length cryptographic representations',
    icon: 'Hash'
  },
  pseudonymization: {
    name: 'Pseudonymization',
    description: 'Replaces identifiers with artificial pseudonyms or codes',
    icon: 'UserX'
  },
  tokenization: {
    name: 'Tokenization',
    description: 'Substitutes sensitive data with non-sensitive tokens',
    icon: 'Key'
  },
  noiseAddition: {
    name: 'Noise Addition',
    description: 'Adds random noise to numerical values while preserving statistical properties',
    icon: 'Waves'
  },
  dataSwapping: {
    name: 'Data Swapping',
    description: 'Exchanges values between records to break linkage',
    icon: 'Shuffle'
  },
  aggregation: {
    name: 'Aggregation',
    description: 'Groups records and reports aggregate statistics instead of individual values',
    icon: 'BarChart3'
  },
  bucketing: {
    name: 'Bucketing',
    description: 'Groups continuous values into discrete buckets or bins',
    icon: 'Archive'
  },
} as const;

export const DEFAULT_PRIVACY_CONFIG: PrivacyAnalysisConfig = {
  kThreshold: 5,
  lThreshold: 2,
  tThreshold: 0.3,
  lDiversityType: 'distinct',
  metricWeights: {
    kAnonymity: 0.20,
    lDiversity: 0.20,
    tCloseness: 0.20,
    techniqueDetection: 0.30,
    reidentificationRisk: 0.10,
  },
  includeDetailedAnalysis: true,
  enabledMetrics: DEFAULT_METRIC_TOGGLE,
  enabledTechniques: DEFAULT_TECHNIQUE_TOGGLE,
};

// ============================================================================
// Input Types for Analysis Functions
// ============================================================================

export interface PrivacyAnalysisInput {
  parsedCSV: ParsedCSV;
  classification: ClassificationResult;
  config?: Partial<PrivacyAnalysisConfig>;
}
