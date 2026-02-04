/**
 * Attribute Classification Types for Privacy Analysis
 * 
 * Classification Categories:
 * - Direct Identifier: Uniquely identifies an individual (e.g., name, SSN, email)
 * - Quasi-Identifier: Can be combined to re-identify (e.g., age, zip code, gender)
 * - Sensitive: Private information requiring protection (e.g., medical conditions, salary)
 * - Non-Sensitive: Public or non-identifying data (e.g., timestamps, generic categories)
 */

export type AttributeType = 
  | 'direct-identifier'
  | 'quasi-identifier'
  | 'sensitive'
  | 'non-sensitive';

export interface AttributeClassification {
  /** Column name from the CSV header */
  name: string;
  /** Classified type of the attribute */
  type: AttributeType;
  /** Confidence score from 0-1 for auto-classification */
  confidence: number;
  /** Whether the classification was manually overridden by user */
  isManualOverride: boolean;
  /** Sample values from the dataset for display */
  sampleValues: string[];
  /** Detected data pattern (e.g., 'numeric', 'categorical', 'date', 'identifier') */
  dataPattern: DataPattern;
  /** Reason for the classification */
  classificationReason: string;
}

export type DataPattern = 
  | 'numeric'
  | 'categorical'
  | 'date'
  | 'identifier'
  | 'text'
  | 'boolean'
  | 'hash'
  | 'location'
  | 'unknown';

export interface ClassificationResult {
  attributes: AttributeClassification[];
  summary: ClassificationSummary;
  timestamp: Date;
}

export interface ClassificationSummary {
  totalAttributes: number;
  directIdentifiers: number;
  quasiIdentifiers: number;
  sensitiveAttributes: number;
  nonSensitiveAttributes: number;
  averageConfidence: number;
}

/**
 * Configuration for the classification engine
 */
export interface ClassificationConfig {
  /** Minimum confidence threshold for auto-classification (0-1) */
  minConfidenceThreshold: number;
  /** Number of sample values to analyze per attribute */
  sampleSize: number;
  /** Enable strict mode (higher confidence requirements) */
  strictMode: boolean;
}

/**
 * Classification rule definition for pattern matching
 */
export interface ClassificationRule {
  /** Patterns to match against column names (case-insensitive) */
  namePatterns: RegExp[];
  /** Patterns to match against sample values */
  valuePatterns?: RegExp[];
  /** The type to assign if matched */
  type: AttributeType;
  /** Base confidence for this rule */
  confidence: number;
  /** Human-readable reason */
  reason: string;
  /** Data pattern this rule typically matches */
  dataPattern?: DataPattern;
}

export interface AttributeTypeInfo {
  title: string;
  label: string;
  icon: React.ComponentType<any>;
  short: string;
  examples: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
}
