import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type {
  DetectedTechnique,
  TechniqueEvidence,
  TechniqueDetectionResult,
  TechniqueRecommendation,
} from '@/types/privacy-analysis';
import type { PrivacyPlugin, PluginInput, PluginOutput, PluginMetadata, MetricStatus } from '@/types/privacy-plugins';

// ============================================================================
// Plugin Configuration
// ============================================================================

export interface TechniqueDetectionConfig {
  /** Minimum confidence threshold for reporting a technique (default: 0.3) */
  minConfidence: number;
  /** Whether to generate recommendations (default: true) */
  generateRecommendations: boolean;
}

const DEFAULT_CONFIG: TechniqueDetectionConfig = {
  minConfidence: 0.3,
  generateRecommendations: true,
};

// ============================================================================
// Plugin Metadata
// ============================================================================

const metadata: PluginMetadata = {
  id: 'technique-detection',
  name: 'Privacy Techniques',
  description: 'Detects privacy-preserving techniques applied to the dataset',
  version: '1.0.0',
  category: 'technique',
  defaultWeight: 0.20,
  required: true,
  author: 'Privacy Index Calculator',
};

// ============================================================================
// Detection Methods
// ============================================================================

/**
 * Detect generalization (values replaced with broader categories)
 */
function detectGeneralization(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => row[colIndex] || '');
    const uniqueValues = [...new Set(values)];

    // Check for range patterns (e.g., "20-30", "30-40")
    const rangePattern = /^\d+[-–]\d+$/;
    const rangeValues = uniqueValues.filter(v => rangePattern.test(v.trim()));
    
    if (rangeValues.length >= 2) {
      evidence.push({
        attribute: attr.name,
        confidence: 0.9,
        evidenceSamples: rangeValues.slice(0, 3),
        reason: 'Numeric range patterns detected (e.g., "20-30")',
      });
    }

    // Check for region/category patterns
    const categoryPattern = /^(Region|Category|Group|Level|Type|Class)[-_]?\d+$/i;
    const categoryValues = uniqueValues.filter(v => categoryPattern.test(v.trim()));
    
    if (categoryValues.length >= 2) {
      evidence.push({
        attribute: attr.name,
        confidence: 0.85,
        evidenceSamples: categoryValues.slice(0, 3),
        reason: 'Categorical generalization patterns detected',
      });
    }

    // Check for very low cardinality in supposedly high-cardinality fields
    if (attr.dataPattern === 'identifier' || attr.type === 'quasi-identifier') {
      const uniqueRatio = uniqueValues.length / parsedCSV.rows.length;
      if (uniqueRatio < 0.1 && uniqueValues.length > 1) {
        evidence.push({
          attribute: attr.name,
          confidence: 0.6,
          evidenceSamples: uniqueValues.slice(0, 3),
          reason: `Low unique value ratio (${(uniqueRatio * 100).toFixed(1)}%) suggests generalization`,
        });
      }
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'generalization',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Values have been replaced with broader categories or ranges',
      privacyBenefit: 'high',
    });
  }

  return techniques;
}

/**
 * Detect suppression (values removed or replaced with wildcards)
 */
function detectSuppression(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  const suppressionPatterns = [
    /^\*+$/,           // All asterisks
    /^[-]+$/,          // All dashes
    /^N\/?A$/i,        // N/A
    /^NULL$/i,         // NULL
    /^REDACTED$/i,     // REDACTED
    /^SUPPRESSED$/i,   // SUPPRESSED
    /^\[REMOVED\]$/i,  // [REMOVED]
    /^XXX+$/i,         // XXX
  ];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => row[colIndex] || '');
    const suppressedValues = values.filter(v => 
      suppressionPatterns.some(p => p.test(v.trim())) || v.trim() === ''
    );

    const suppressionRate = suppressedValues.length / values.length;

    if (suppressionRate > 0.01 && suppressedValues.length > 0) {
      const uniqueSuppressed = [...new Set(suppressedValues)].filter(v => v !== '');
      evidence.push({
        attribute: attr.name,
        confidence: Math.min(suppressionRate * 5, 0.95),
        evidenceSamples: uniqueSuppressed.slice(0, 3),
        reason: `${(suppressionRate * 100).toFixed(1)}% of values appear suppressed`,
      });
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'suppression',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Some values have been removed or replaced with placeholders',
      privacyBenefit: 'medium',
    });
  }

  return techniques;
}

/**
 * Detect masking (partial hiding of values)
 */
function detectMasking(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  const maskingPatterns = [
    /\*{2,}/,                    // Multiple asterisks
    /X{2,}/i,                    // Multiple X's
    /^\d{3}-\*{2}-\d{4}$/,       // SSN with masked middle
    /^\*{4}-\*{4}-\*{4}-\d{4}$/, // Credit card last 4
    /^[\w.]+@\*+\.\w+$/,         // Partial email masking
    /^\+?\d{1,3}-?\*+-\d{2,4}$/, // Phone with partial mask
  ];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => row[colIndex] || '');
    const maskedValues = values.filter(v => 
      maskingPatterns.some(p => p.test(v.trim()))
    );

    if (maskedValues.length > 0) {
      const uniqueMasked = [...new Set(maskedValues)];
      evidence.push({
        attribute: attr.name,
        confidence: 0.9,
        evidenceSamples: uniqueMasked.slice(0, 3),
        reason: 'Partial masking patterns detected',
      });
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'masking',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Values have been partially masked while preserving some information',
      privacyBenefit: 'medium',
    });
  }

  return techniques;
}

/**
 * Detect hashing (cryptographic transformation)
 */
function detectHashing(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  const hashPatterns = [
    { pattern: /^[a-f0-9]{8}$/i, name: 'Short hash (8 chars)' },
    { pattern: /^[a-f0-9]{16}$/i, name: 'MD5 prefix (16 chars)' },
    { pattern: /^[a-f0-9]{32}$/i, name: 'MD5 hash (32 chars)' },
    { pattern: /^[a-f0-9]{40}$/i, name: 'SHA-1 hash (40 chars)' },
    { pattern: /^[a-f0-9]{64}$/i, name: 'SHA-256 hash (64 chars)' },
    { pattern: /^[a-f0-9]{128}$/i, name: 'SHA-512 hash (128 chars)' },
  ];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => row[colIndex] || '');
    const uniqueValues = [...new Set(values)];

    for (const { pattern, name } of hashPatterns) {
      const matchingValues = uniqueValues.filter(v => pattern.test(v.trim()));
      const matchRatio = matchingValues.length / uniqueValues.length;

      if (matchRatio > 0.8 && matchingValues.length >= 3) {
        evidence.push({
          attribute: attr.name,
          confidence: Math.min(matchRatio, 0.95),
          evidenceSamples: matchingValues.slice(0, 3),
          reason: `${name} pattern detected in ${(matchRatio * 100).toFixed(0)}% of values`,
        });
        break;
      }
    }

    // Check for hash column names
    const hashNamePattern = /hash|digest|checksum|sha|md5/i;
    if (hashNamePattern.test(attr.name)) {
      evidence.push({
        attribute: attr.name,
        confidence: 0.7,
        evidenceSamples: uniqueValues.slice(0, 3),
        reason: 'Column name suggests hashed values',
      });
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'hashing',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Values have been cryptographically hashed',
      privacyBenefit: 'high',
    });
  }

  return techniques;
}

/**
 * Detect pseudonymization (artificial identifiers)
 */
function detectPseudonymization(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  const pseudonymPatterns = [
    /^[A-Z]{1,3}\d{2,6}[A-Z]{0,2}$/i,
    /^(Patient|User|Customer|Client|Subject|Person)[-_]?\d+$/i,
    /^[A-Z]{2,4}[-_]\d{4,8}$/i,
    /^ID[-_]?[a-f0-9]{4,12}$/i,
  ];

  for (const attr of classification.attributes) {
    if (attr.type !== 'direct-identifier' && attr.dataPattern !== 'identifier') {
      continue;
    }

    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => row[colIndex] || '');
    const uniqueValues = [...new Set(values)];

    for (const pattern of pseudonymPatterns) {
      const matchingValues = uniqueValues.filter(v => pattern.test(v.trim()));
      const matchRatio = matchingValues.length / uniqueValues.length;

      if (matchRatio > 0.8) {
        evidence.push({
          attribute: attr.name,
          confidence: Math.min(matchRatio, 0.9),
          evidenceSamples: matchingValues.slice(0, 3),
          reason: 'Systematic pseudonym pattern detected',
        });
        break;
      }
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'pseudonymization',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Direct identifiers have been replaced with pseudonyms',
      privacyBenefit: 'high',
    });
  }

  return techniques;
}

/**
 * Detect bucketing (values grouped into buckets)
 */
function detectBucketing(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  const bucketPatterns = [
    /^(Low|Medium|High|Very\s*High|Very\s*Low)$/i,
    /^(Small|Large|Extra\s*Large|XL|XXL)$/i,
    /^(Young|Middle[-\s]?Aged?|Old|Elderly|Senior)$/i,
    /^(Tier|Level|Grade|Class)[-\s]?[1-5A-E]$/i,
    /^<?\d+[-–]\d+>?$/,
    /^[<>≤≥]=?\s*\d+$/,
  ];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => row[colIndex] || '');
    const uniqueValues = [...new Set(values)];

    const matchingValues = uniqueValues.filter(v =>
      bucketPatterns.some(p => p.test(v.trim()))
    );

    if (matchingValues.length >= 2 && matchingValues.length <= 10) {
      const matchRatio = matchingValues.length / uniqueValues.length;
      if (matchRatio > 0.5) {
        evidence.push({
          attribute: attr.name,
          confidence: Math.min(matchRatio, 0.85),
          evidenceSamples: matchingValues.slice(0, 4),
          reason: 'Values appear to be bucketed into categories',
        });
      }
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'bucketing',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Continuous values have been grouped into discrete buckets',
      privacyBenefit: 'medium',
    });
  }

  return techniques;
}

/**
 * Detect noise addition (statistical noise in numerical values)
 */
function detectNoiseAddition(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  for (const attr of classification.attributes) {
    if (attr.dataPattern !== 'numeric') continue;

    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows
      .map(row => parseFloat(row[colIndex]))
      .filter(v => !isNaN(v));

    if (values.length < 10) continue;

    const precisions = values.map(v => {
      const str = v.toString();
      const decimalPart = str.split('.')[1] || '';
      return decimalPart.length;
    });

    const avgPrecision = precisions.reduce((a, b) => a + b, 0) / precisions.length;
    const uniquePrecisions = new Set(precisions).size;

    if (avgPrecision > 4 && uniquePrecisions > 3) {
      evidence.push({
        attribute: attr.name,
        confidence: 0.5,
        evidenceSamples: values.slice(0, 3).map(v => v.toString()),
        reason: `High decimal precision variability (avg ${avgPrecision.toFixed(1)} digits) may indicate noise addition`,
      });
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'noise-addition',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Statistical noise may have been added to numerical values',
      privacyBenefit: 'medium',
    });
  }

  return techniques;
}

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Detect privacy-preserving techniques applied to a dataset
 */
function detectPrivacyTechniques(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  minConfidence: number = 0.3,
  generateRecs: boolean = true
): TechniqueDetectionResult {
  const detectedTechniques: DetectedTechnique[] = [];
  const protectedAttributes = new Set<string>();

  // Run all detection methods
  const detectionMethods = [
    detectGeneralization,
    detectSuppression,
    detectMasking,
    detectHashing,
    detectPseudonymization,
    detectBucketing,
    detectNoiseAddition,
  ];

  for (const detectMethod of detectionMethods) {
    const results = detectMethod(parsedCSV, classification);
    for (const technique of results) {
      if (technique.confidence > minConfidence) {
        detectedTechniques.push(technique);
        technique.affectedAttributes.forEach(attr => protectedAttributes.add(attr));
      }
    }
  }

  // Calculate technique coverage
  const techniqueCoverage = classification.attributes.length > 0
    ? protectedAttributes.size / classification.attributes.length
    : 0;

  // Calculate technique score
  const techniqueScore = calculateTechniqueScore(detectedTechniques, techniqueCoverage);

  // Generate recommendations
  const recommendations = generateRecs 
    ? generateRecommendations(classification, detectedTechniques)
    : [];

  return {
    detectedTechniques,
    techniqueCoverage,
    protectedAttributeCount: protectedAttributes.size,
    totalAttributes: classification.attributes.length,
    techniqueScore,
    recommendations,
  };
}

/**
 * Calculate technique score based on detected techniques and coverage
 */
function calculateTechniqueScore(
  techniques: DetectedTechnique[],
  coverage: number
): number {
  if (techniques.length === 0) {
    return 20;
  }

  const benefitPoints = {
    high: 20,
    medium: 12,
    low: 5,
  };

  let techniquePoints = 0;
  for (const tech of techniques) {
    techniquePoints += benefitPoints[tech.privacyBenefit] * tech.confidence;
  }

  techniquePoints = Math.min(techniquePoints, 60);
  const coveragePoints = coverage * 40;

  return Math.round(Math.min(techniquePoints + coveragePoints, 100));
}

/**
 * Generate recommendations for additional privacy techniques
 */
function generateRecommendations(
  classification: ClassificationResult,
  detectedTechniques: DetectedTechnique[]
): TechniqueRecommendation[] {
  const recommendations: TechniqueRecommendation[] = [];
  const protectedAttributes = new Set(
    detectedTechniques.flatMap(t => t.affectedAttributes)
  );

  // Check for unprotected direct identifiers
  const unprotectedDI = classification.attributes
    .filter(a => a.type === 'direct-identifier' && !protectedAttributes.has(a.name));

  if (unprotectedDI.length > 0) {
    recommendations.push({
      technique: 'pseudonymization',
      targetAttributes: unprotectedDI.map(a => a.name),
      priority: 'critical',
      reason: 'Direct identifiers should be pseudonymized or removed.',
    });

    recommendations.push({
      technique: 'hashing',
      targetAttributes: unprotectedDI.map(a => a.name),
      priority: 'high',
      reason: 'Consider hashing direct identifiers if linkage is needed.',
    });
  }

  // Check for unprotected quasi-identifiers
  const unprotectedQI = classification.attributes
    .filter(a => a.type === 'quasi-identifier' && !protectedAttributes.has(a.name));

  if (unprotectedQI.length > 0) {
    recommendations.push({
      technique: 'generalization',
      targetAttributes: unprotectedQI.map(a => a.name),
      priority: 'high',
      reason: 'Quasi-identifiers should be generalized to achieve k-anonymity.',
    });
  }

  // Check for unprotected sensitive attributes
  const unprotectedSA = classification.attributes
    .filter(a => a.type === 'sensitive' && !protectedAttributes.has(a.name));

  if (unprotectedSA.length > 0) {
    recommendations.push({
      technique: 'bucketing',
      targetAttributes: unprotectedSA.map(a => a.name),
      priority: 'medium',
      reason: 'Sensitive attributes could benefit from bucketing.',
    });
  }

  return recommendations;
}

/**
 * Get status based on score
 */
function getStatus(score: number): MetricStatus {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warning';
  return 'fail';
}

/**
 * Generate insights from the result
 */
function generateInsights(result: TechniqueDetectionResult): string[] {
  const insights: string[] = [];

  if (result.detectedTechniques.length === 0) {
    insights.push('⚠️ No privacy techniques detected in this dataset');
  } else {
    insights.push(
      `✓ ${result.detectedTechniques.length} privacy technique(s) detected`
    );
  }

  const highBenefit = result.detectedTechniques.filter(t => t.privacyBenefit === 'high');
  if (highBenefit.length > 0) {
    insights.push(
      `✓ ${highBenefit.length} high-benefit technique(s): ${highBenefit.map(t => t.technique).join(', ')}`
    );
  }

  const coverage = result.techniqueCoverage * 100;
  if (coverage < 50) {
    insights.push(
      `⚠️ Only ${coverage.toFixed(0)}% of attributes have protection`
    );
  } else {
    insights.push(
      `✓ ${coverage.toFixed(0)}% of attributes have protection`
    );
  }

  return insights;
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * Technique Detection Plugin
 */
export const techniqueDetectionPlugin: PrivacyPlugin<TechniqueDetectionResult, TechniqueDetectionConfig> = {
  metadata,

  calculate(input: PluginInput, pluginConfig?: TechniqueDetectionConfig): PluginOutput<TechniqueDetectionResult> {
    const config = { ...DEFAULT_CONFIG, ...pluginConfig };

    const result = detectPrivacyTechniques(
      input.parsedCSV,
      input.classification,
      config.minConfidence,
      config.generateRecommendations
    );

    const score = result.techniqueScore;
    const status = getStatus(score);
    const insights = generateInsights(result);

    return {
      result,
      score,
      status,
      details: `${result.detectedTechniques.length} technique(s) detected, ${(result.techniqueCoverage * 100).toFixed(0)}% coverage`,
      insights,
    };
  },

  canCalculate(input: PluginInput): boolean {
    return input.parsedCSV.rows.length > 0 && input.classification.attributes.length > 0;
  },

  getDefaultConfig(): TechniqueDetectionConfig {
    return { ...DEFAULT_CONFIG };
  },

  validateConfig(config: TechniqueDetectionConfig): true | string {
    if (typeof config.minConfidence !== 'number' || config.minConfidence < 0 || config.minConfidence > 1) {
      return 'minConfidence must be a number between 0 and 1';
    }
    return true;
  },
};

// ============================================================================
// Utility Exports (for backward compatibility)
// ============================================================================

export { detectPrivacyTechniques, calculateTechniqueScore as calculateTechniqueDetectionScore };

export default techniqueDetectionPlugin;
