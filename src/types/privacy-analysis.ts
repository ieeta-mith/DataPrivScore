import type { ClassificationResult } from './attribute-classification';
import type { ParsedCSV } from './csv-parser';

// ============================================================================
// K-Anonymity Types
// ============================================================================

export interface EquivalenceClass {
  // Unique identifier for the equivalence class
  id: string;
  // The quasi-identifier values that define this class
  quasiIdentifierValues: Record<string, string>;
  // Number of records in this equivalence class
  size: number;
  // Row indices belonging to this class
  rowIndices: number[];
}

export interface KAnonymityResult {
  // The minimum k value achieved (smallest equivalence class size)
  kValue: number;
  // Whether the dataset satisfies k-anonymity for the given threshold
  satisfiesKAnonymity: boolean;
  // The k threshold used for evaluation
  kThreshold: number;
  // Total number of equivalence classes
  equivalenceClassCount: number;
  // Distribution of equivalence class sizes
  sizeDistribution: Record<number, number>;
  // Classes that violate k-anonymity (size < k)
  violatingClasses: EquivalenceClass[];
  // Percentage of records in compliant classes
  complianceRate: number;
  // Average equivalence class size
  averageClassSize: number;
  // Quasi-identifiers used for calculation
  quasiIdentifiers: string[];
}

// ============================================================================
// L-Diversity Types
// ============================================================================

export type LDiversityType = 'distinct' | 'entropy' | 'recursive';

export interface LDiversityClassResult {
  // Equivalence class reference
  equivalenceClassId: string;
  // Number of distinct sensitive values
  distinctCount: number;
  // Entropy of sensitive value distribution
  entropy: number;
  // Whether this class satisfies l-diversity
  satisfiesLDiversity: boolean;
  // Distribution of sensitive values in this class
  sensitiveValueDistribution: Record<string, number>;
}

export interface LDiversityResult {
  // The minimum l value achieved
  lValue: number;
  // Whether the dataset satisfies l-diversity for the given threshold
  satisfiesLDiversity: boolean;
  // The l threshold used for evaluation
  lThreshold: number;
  // Type of l-diversity calculated
  diversityType: LDiversityType;
  // Per-class l-diversity results
  classResults: LDiversityClassResult[];
  // Classes that violate l-diversity
  violatingClasses: string[];
  // Percentage of records in compliant classes
  complianceRate: number;
  // Sensitive attributes analyzed
  sensitiveAttributes: string[];
  // Average entropy across all classes
  averageEntropy: number;
}

// ============================================================================
// T-Closeness Types
// ============================================================================

export interface TClosenessClassResult {
  // Equivalence class reference
  equivalenceClassId: string;
  // Earth Mover's Distance from overall distribution
  distance: number;
  // Whether this class satisfies t-closeness
  satisfiesTCloseness: boolean;
  // Local distribution of sensitive values
  localDistribution: Record<string, number>;
}

export interface TClosenessResult {
  // Maximum distance observed (worst case)
  maxDistance: number;
  // Whether the dataset satisfies t-closeness for the given threshold
  satisfiesTCloseness: boolean;
  // The t threshold used for evaluation
  tThreshold: number;
  // Per-class t-closeness results
  classResults: TClosenessClassResult[];
  // Classes that violate t-closeness
  violatingClasses: string[];
  // Percentage of records in compliant classes
  complianceRate: number;
  // Global distribution of sensitive values
  globalDistribution: Record<string, number>;
  // Sensitive attribute analyzed
  sensitiveAttribute: string;
  // Average distance across all classes
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
  // The attribute where the technique was detected
  attribute: string;
  // Confidence score for this detection (0-1)
  confidence: number;
  // Sample values that indicate this technique
  evidenceSamples: string[];
  // Description of why this technique was detected
  reason: string;
}

export interface DetectedTechnique {
  // The privacy technique detected
  technique: PrivacyTechnique;
  // Attributes where this technique was applied
  affectedAttributes: string[];
  // Overall confidence for this technique detection
  confidence: number;
  // Evidence supporting this detection
  evidence: TechniqueEvidence[];
  // Human-readable description
  description: string;
  // Privacy benefit of this technique
  privacyBenefit: 'low' | 'medium' | 'high';
}

export interface TechniqueDetectionResult {
  // All detected privacy techniques
  detectedTechniques: DetectedTechnique[];
  // Overall privacy technique coverage (0-1)
  techniqueCoverage: number;
  // Number of attributes with detected techniques
  protectedAttributeCount: number;
  // Total number of attributes analyzed
  totalAttributes: number;
  // Summary score based on techniques (0-100)
  techniqueScore: number;
  // Recommendations for additional techniques
  recommendations: TechniqueRecommendation[];
}

export interface TechniqueRecommendation {
  // Recommended technique
  technique: PrivacyTechnique;
  // Attributes that would benefit from this technique
  targetAttributes: string[];
  // Priority level
  priority: 'critical' | 'high' | 'medium' | 'low';
  // Explanation
  reason: string;
}

// ============================================================================
// Privacy Index Types
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface PrivacyMetricScore {
  // Name of the metric
  name: string;
  // Score from 0-100
  score: number;
  // Weight in the overall calculation
  weight: number;
  // Weighted contribution to final score
  weightedScore: number;
  // Status indicator
  status: 'pass' | 'warning' | 'fail';
  // Details about the metric
  details: string;
}

export interface ReidentificationRisk {
  // Overall risk score (0-100, lower is better privacy)
  riskScore: number;
  // Risk level classification
  riskLevel: RiskLevel;
  // Estimated probability of re-identification
  reidentificationProbability: number;
  // Risk factors contributing to the score
  riskFactors: RiskFactor[];
  // Prosecutor attack risk (attacker knows target is in dataset)
  prosecutorRisk: number;
  // Journalist attack risk (attacker doesn't know if target is in dataset)
  journalistRisk: number;
  // Marketer attack risk (attacker targets any individual)
  marketerRisk: number;
}

export interface RiskFactor {
  // Factor name
  factor: string;
  // Impact on risk (0-100)
  impact: number;
  // Description
  description: string;
  // Mitigation suggestion
  mitigation: string;
}

export interface PrivacyIndexResult {
  // Overall privacy index score (0-100)
  overallScore: number;
  // Risk level based on score
  riskLevel: RiskLevel;
  // Letter grade (A-F)
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  // Individual metric scores
  metricScores: PrivacyMetricScore[];
  // K-Anonymity analysis
  kAnonymity: KAnonymityResult;
  // L-Diversity analysis
  lDiversity: LDiversityResult;
  // T-Closeness analysis
  tCloseness: TClosenessResult;
  // Privacy technique detection
  techniqueDetection: TechniqueDetectionResult;
  // Re-identification risk assessment
  reidentificationRisk: ReidentificationRisk;
  // Timestamp of analysis
  timestamp: Date;
  // Analysis metadata
  metadata: AnalysisMetadata;
  // Recommendations for improvement
  recommendations: PrivacyRecommendation[];
}

export interface AnalysisMetadata {
  // Number of records analyzed
  recordCount: number;
  // Number of attributes
  attributeCount: number;
  // Classification result used
  classificationSummary: {
    directIdentifiers: number;
    quasiIdentifiers: number;
    sensitiveAttributes: number;
    nonSensitiveAttributes: number;
  };
  // Analysis duration in milliseconds
  analysisDuration: number;
  // Configuration used
  config: PrivacyAnalysisConfig;
}

export interface PrivacyRecommendation {
  // Recommendation ID
  id: string;
  // Priority level
  priority: 'critical' | 'high' | 'medium' | 'low';
  // Category of recommendation
  category: 'k-anonymity' | 'l-diversity' | 't-closeness' | 'technique' | 'general';
  // Title
  title: string;
  // Detailed description
  description: string;
  // Expected impact on privacy score
  expectedImpact: number;
  // Affected attributes
  affectedAttributes: string[];
  // Suggested action
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
  // K-anonymity threshold (default: 5)
  kThreshold: number;
  // L-diversity threshold (default: 2)
  lThreshold: number;
  // T-closeness threshold (default: 0.15)
  tThreshold: number;
  // L-diversity type to use
  lDiversityType: LDiversityType;
  // Weights for each metric in final score
  metricWeights: {
    kAnonymity: number;
    lDiversity: number;
    tCloseness: number;
    techniqueDetection: number;
    reidentificationRisk: number;
  };
  // Whether to include detailed class-level analysis
  includeDetailedAnalysis: boolean;
  // Enabled metrics toggle
  enabledMetrics: MetricToggle;
  // Enabled techniques toggle for detection
  enabledTechniques: TechniqueToggle;
}

// Threshold limits and defaults for validation and guidance
export const METRIC_THRESHOLDS = {
  kAnonymity: {
    min: 2,
    max: 20,
    default: 5,
    recommended: { min: 3, max: 10 },
    label: 'K-Anonymity Threshold (k)',
    description: 'Minimum records with same quasi-identifier values',
    unit: 'records',
  },
  lDiversity: {
    min: 2,
    max: 10,
    default: 2,
    recommended: { min: 2, max: 5 },
    label: 'L-Diversity Threshold (l)',
    description: 'Minimum distinct sensitive values per group',
    unit: 'values',
  },
  tCloseness: {
    min: 0.01,
    max: 0.5,
    default: 0.3,
    recommended: { min: 0.15, max: 0.35 },
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
    icon: 'Layers',
    privacyBenefit: 'high' as const,
  },
  suppression: {
    name: 'Suppression',
    description: 'Removes or replaces sensitive values with placeholders (e.g., "*", "N/A")',
    icon: 'EyeOff',
    privacyBenefit: 'high' as const,
  },
  masking: {
    name: 'Masking',
    description: 'Partially hides values while preserving some information (e.g., "***-**-1234")',
    icon: 'Mask',
    privacyBenefit: 'medium' as const,
  },
  hashing: {
    name: 'Hashing',
    description: 'Transforms values into fixed-length cryptographic representations',
    icon: 'Hash',
    privacyBenefit: 'high' as const,
  },
  pseudonymization: {
    name: 'Pseudonymization',
    description: 'Replaces identifiers with artificial pseudonyms or codes',
    icon: 'UserX',
    privacyBenefit: 'medium' as const,
  },
  tokenization: {
    name: 'Tokenization',
    description: 'Substitutes sensitive data with non-sensitive tokens',
    icon: 'Key',
    privacyBenefit: 'high' as const,
  },
  noiseAddition: {
    name: 'Noise Addition',
    description: 'Adds random noise to numerical values while preserving statistical properties',
    icon: 'Waves',
    privacyBenefit: 'medium' as const,
  },
  dataSwapping: {
    name: 'Data Swapping',
    description: 'Exchanges values between records to break linkage',
    icon: 'Shuffle',
    privacyBenefit: 'medium' as const,
  },
  aggregation: {
    name: 'Aggregation',
    description: 'Groups records and reports aggregate statistics instead of individual values',
    icon: 'BarChart3',
    privacyBenefit: 'high' as const,
  },
  bucketing: {
    name: 'Bucketing',
    description: 'Groups continuous values into discrete buckets or bins',
    icon: 'Archive',
    privacyBenefit: 'medium' as const,
  },
} as const;

export const DEFAULT_PRIVACY_CONFIG: PrivacyAnalysisConfig = {
  kThreshold: 5,
  lThreshold: 2,
  tThreshold: 0.3,
  lDiversityType: 'distinct',
  metricWeights: {
    kAnonymity: 0.25,
    lDiversity: 0.20,
    tCloseness: 0.3,
    techniqueDetection: 0.20,
    reidentificationRisk: 0.20,
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
