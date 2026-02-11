import type { ClassificationResult } from './attribute-classification';
import type { ParsedCSV } from './csv-parser';

// ============================================================================
// K-Anonymity Types
// ============================================================================

export interface EquivalenceClass {
  /** Unique identifier for this equivalence class */
  id: string;
  /** The quasi-identifier values that define this class */
  quasiIdentifierValues: Record<string, string>;
  /** Number of records in this equivalence class */
  size: number;
  /** Row indices belonging to this class */
  rowIndices: number[];
}

export interface KAnonymityResult {
  /** The minimum k value achieved (smallest equivalence class size) */
  kValue: number;
  /** Whether the dataset satisfies k-anonymity for the given threshold */
  satisfiesKAnonymity: boolean;
  /** The k threshold used for evaluation */
  kThreshold: number;
  /** Total number of equivalence classes */
  equivalenceClassCount: number;
  /** Distribution of equivalence class sizes */
  sizeDistribution: Record<number, number>;
  /** Classes that violate k-anonymity (size < k) */
  violatingClasses: EquivalenceClass[];
  /** Percentage of records in compliant classes */
  complianceRate: number;
  /** Average equivalence class size */
  averageClassSize: number;
  /** Quasi-identifiers used for calculation */
  quasiIdentifiers: string[];
}

// ============================================================================
// L-Diversity Types
// ============================================================================

export type LDiversityType = 'distinct' | 'entropy' | 'recursive';

export interface LDiversityClassResult {
  /** Equivalence class reference */
  equivalenceClassId: string;
  /** Number of distinct sensitive values */
  distinctCount: number;
  /** Entropy of sensitive value distribution */
  entropy: number;
  /** Whether this class satisfies l-diversity */
  satisfiesLDiversity: boolean;
  /** Distribution of sensitive values in this class */
  sensitiveValueDistribution: Record<string, number>;
}

export interface LDiversityResult {
  /** The minimum l value achieved */
  lValue: number;
  /** Whether the dataset satisfies l-diversity for the given threshold */
  satisfiesLDiversity: boolean;
  /** The l threshold used for evaluation */
  lThreshold: number;
  /** Type of l-diversity calculated */
  diversityType: LDiversityType;
  /** Per-class l-diversity results */
  classResults: LDiversityClassResult[];
  /** Classes that violate l-diversity */
  violatingClasses: string[];
  /** Percentage of records in compliant classes */
  complianceRate: number;
  /** Sensitive attributes analyzed */
  sensitiveAttributes: string[];
  /** Average entropy across all classes */
  averageEntropy: number;
}

// ============================================================================
// T-Closeness Types
// ============================================================================

export interface TClosenessClassResult {
  /** Equivalence class reference */
  equivalenceClassId: string;
  /** Earth Mover's Distance from overall distribution */
  distance: number;
  /** Whether this class satisfies t-closeness */
  satisfiesTCloseness: boolean;
  /** Local distribution of sensitive values */
  localDistribution: Record<string, number>;
}

export interface TClosenessResult {
  /** Maximum distance observed (worst case) */
  maxDistance: number;
  /** Whether the dataset satisfies t-closeness for the given threshold */
  satisfiesTCloseness: boolean;
  /** The t threshold used for evaluation */
  tThreshold: number;
  /** Per-class t-closeness results */
  classResults: TClosenessClassResult[];
  /** Classes that violate t-closeness */
  violatingClasses: string[];
  /** Percentage of records in compliant classes */
  complianceRate: number;
  /** Global distribution of sensitive values */
  globalDistribution: Record<string, number>;
  /** Sensitive attribute analyzed */
  sensitiveAttribute: string;
  /** Average distance across all classes */
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
  /** The attribute where the technique was detected */
  attribute: string;
  /** Confidence score for this detection (0-1) */
  confidence: number;
  /** Sample values that indicate this technique */
  evidenceSamples: string[];
  /** Description of why this technique was detected */
  reason: string;
}

export interface DetectedTechnique {
  /** The privacy technique detected */
  technique: PrivacyTechnique;
  /** Attributes where this technique was applied */
  affectedAttributes: string[];
  /** Overall confidence for this technique detection */
  confidence: number;
  /** Evidence supporting this detection */
  evidence: TechniqueEvidence[];
  /** Human-readable description */
  description: string;
  /** Privacy benefit of this technique */
  privacyBenefit: 'low' | 'medium' | 'high';
}

export interface TechniqueDetectionResult {
  /** All detected privacy techniques */
  detectedTechniques: DetectedTechnique[];
  /** Overall privacy technique coverage (0-1) */
  techniqueCoverage: number;
  /** Number of attributes with detected techniques */
  protectedAttributeCount: number;
  /** Total number of attributes analyzed */
  totalAttributes: number;
  /** Summary score based on techniques (0-100) */
  techniqueScore: number;
  /** Recommendations for additional techniques */
  recommendations: TechniqueRecommendation[];
}

export interface TechniqueRecommendation {
  /** Recommended technique */
  technique: PrivacyTechnique;
  /** Attributes that would benefit from this technique */
  targetAttributes: string[];
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Explanation */
  reason: string;
}

// ============================================================================
// Privacy Index Types
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface PrivacyMetricScore {
  /** Name of the metric */
  name: string;
  /** Score from 0-100 */
  score: number;
  /** Weight in the overall calculation */
  weight: number;
  /** Weighted contribution to final score */
  weightedScore: number;
  /** Status indicator */
  status: 'pass' | 'warning' | 'fail';
  /** Details about the metric */
  details: string;
}

export interface ReidentificationRisk {
  /** Overall risk score (0-100, lower is better privacy) */
  riskScore: number;
  /** Risk level classification */
  riskLevel: RiskLevel;
  /** Estimated probability of re-identification */
  reidentificationProbability: number;
  /** Risk factors contributing to the score */
  riskFactors: RiskFactor[];
  /** Prosecutor attack risk (attacker knows target is in dataset) */
  prosecutorRisk: number;
  /** Journalist attack risk (attacker doesn't know if target is in dataset) */
  journalistRisk: number;
  /** Marketer attack risk (attacker targets any individual) */
  marketerRisk: number;
}

export interface RiskFactor {
  /** Factor name */
  factor: string;
  /** Impact on risk (0-100) */
  impact: number;
  /** Description */
  description: string;
  /** Mitigation suggestion */
  mitigation: string;
}

export interface PrivacyIndexResult {
  /** Overall privacy index score (0-100) */
  overallScore: number;
  /** Risk level based on score */
  riskLevel: RiskLevel;
  /** Letter grade (A-F) */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Individual metric scores */
  metricScores: PrivacyMetricScore[];
  /** K-Anonymity analysis */
  kAnonymity: KAnonymityResult;
  /** L-Diversity analysis */
  lDiversity: LDiversityResult;
  /** T-Closeness analysis */
  tCloseness: TClosenessResult;
  /** Privacy technique detection */
  techniqueDetection: TechniqueDetectionResult;
  /** Re-identification risk assessment */
  reidentificationRisk: ReidentificationRisk;
  /** Timestamp of analysis */
  timestamp: Date;
  /** Analysis metadata */
  metadata: AnalysisMetadata;
  /** Recommendations for improvement */
  recommendations: PrivacyRecommendation[];
}

export interface AnalysisMetadata {
  /** Number of records analyzed */
  recordCount: number;
  /** Number of attributes */
  attributeCount: number;
  /** Classification result used */
  classificationSummary: {
    directIdentifiers: number;
    quasiIdentifiers: number;
    sensitiveAttributes: number;
    nonSensitiveAttributes: number;
  };
  /** Analysis duration in milliseconds */
  analysisDuration: number;
  /** Configuration used */
  config: PrivacyAnalysisConfig;
}

export interface PrivacyRecommendation {
  /** Recommendation ID */
  id: string;
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Category of recommendation */
  category: 'k-anonymity' | 'l-diversity' | 't-closeness' | 'technique' | 'general';
  /** Title */
  title: string;
  /** Detailed description */
  description: string;
  /** Expected impact on privacy score */
  expectedImpact: number;
  /** Affected attributes */
  affectedAttributes: string[];
  /** Suggested action */
  action: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface PrivacyAnalysisConfig {
  /** K-anonymity threshold (default: 5) */
  kThreshold: number;
  /** L-diversity threshold (default: 2) */
  lThreshold: number;
  /** T-closeness threshold (default: 0.15) */
  tThreshold: number;
  /** L-diversity type to use */
  lDiversityType: LDiversityType;
  /** Weights for each metric in final score */
  metricWeights: {
    kAnonymity: number;
    lDiversity: number;
    tCloseness: number;
    techniqueDetection: number;
    reidentificationRisk: number;
  };
  /** Whether to include detailed class-level analysis */
  includeDetailedAnalysis: boolean;
}

export const DEFAULT_PRIVACY_CONFIG: PrivacyAnalysisConfig = {
  kThreshold: 5,
  lThreshold: 2,
  tThreshold: 0.15,
  lDiversityType: 'distinct',
  metricWeights: {
    kAnonymity: 0.25,
    lDiversity: 0.20,
    tCloseness: 0.15,
    techniqueDetection: 0.20,
    reidentificationRisk: 0.20,
  },
  includeDetailedAnalysis: true,
};

// ============================================================================
// Input Types for Analysis Functions
// ============================================================================

export interface PrivacyAnalysisInput {
  parsedCSV: ParsedCSV;
  classification: ClassificationResult;
  config?: Partial<PrivacyAnalysisConfig>;
}
