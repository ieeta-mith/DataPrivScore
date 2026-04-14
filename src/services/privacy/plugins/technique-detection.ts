import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type {
  DetectedTechnique,
  TechniqueEvidence,
  TechniqueDetectionResult,
  TechniqueRecommendation,
  TechniqueToggle,
} from '@/types/privacy-analysis';
import { DEFAULT_TECHNIQUE_TOGGLE } from '@/utils/constants';
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

function detectGeneralization(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => (row[colIndex] || '').trim());
    const validValues = values.filter (v => v !== '');
    if (validValues.length === 0) continue;

    const uniqueValues = [...new Set(validValues)];
    
    // Check for range patterns
    const rangePattern = /^\d+[-–]\d+$/;
    const rangeValues = validValues.filter(v => rangePattern.test(v));
    const rangeRatio = rangeValues.length / validValues.length;

    // Require at least 15% of the column to match the range pattern to consider it generalized
    if (rangeRatio >= 0.15) {
      const uniqueRanges = [...new Set(rangeValues)];
      evidence.push({
        attribute: attr.name,
        confidence: Math.min(rangeRatio + 0.4, 0.95),
        evidenceSamples: uniqueRanges.slice(0, 3),
        reason: `Numeric ranges detected in ${(rangeRatio * 100).toFixed(1)}% of rows`,
      })
    }
    // Check for categorical bins replacing high cardinality data
    if (attr.type === 'quasi-identifier' || attr.dataPattern === 'categorical') {
      const uniqueRatio = uniqueValues.length / validValues.length;
      if (uniqueRatio < 0.05 && uniqueValues.length >= 2 && uniqueValues.length <= 15) {
        evidence.push({
          attribute: attr.name,
          confidence: 0.6,
          evidenceSamples: uniqueValues.slice(0, 3),
          reason: `High frequency of highly consolidated values suggests binning/generalization`,
        })
      }
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'generalization',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Values have been generalized to reduce granularity',
      privacyBenefit: 'high',
    });
  }

  return techniques;
}

/** 
 * Calculate the Shannon Entropy of a string
 * Used to distinguish true cryptographic hashes from standard sequential or UUID 
*/
function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;

  const charCounts = new Map<string, number>();
  for (const char of str) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const count of charCounts.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
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

  const explicitPatterns = [
    /^REDACTED$/i,
    /^SUPPRESSED$/i,
    /^\[REMOVED\]$/i,
    /^\*{3,}$/,
    /^X{3,}$/i
  ]

  const implicitPatterns = [
    /^N\/?A$/i,        
    /^NULL$/i,         
    /^[-]+$/,          
    /^$/
  ]

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => (row[colIndex] || '').trim());

    const explicitMatches = values.filter(v => explicitPatterns.some(p => p.test(v)));
    const implicitMatches = values.filter(v => implicitPatterns.some(p => p.test(v)));

    const explicitRate = explicitMatches.length / values.length;

    // Only consider implicit patterns if explicit suppression is not dominant
    if (explicitRate > 0.01) {
      const uniqueExplicit = [...new Set(explicitMatches)];
      evidence.push({
        attribute: attr.name,
        confidence: Math.min(explicitRate * 10, 0.95),
        evidenceSamples: uniqueExplicit.slice(0, 3),
        reason: `Explicit redaction detected in ${(explicitRate * 100).toFixed(1)}% of values`,
      });
    } else if (implicitMatches.length > 0 && explicitMatches.length === 0) {
      // If there are a few explicit + lots of implicit, report with lower confidence
      const uniqueImplicit = [...new Set(implicitMatches)].filter(v => v !== '');
      evidence.push({
        attribute: attr.name,
        confidence: 0.4,
        evidenceSamples: uniqueImplicit.slice(0, 3),
        reason: 'Combination of missing data and minor explicit redaction detected',
      })
    }
  }

  if (evidence.length > 0) {
    techniques.push({
      technique: 'suppression',
      affectedAttributes: [...new Set(evidence.map(e => e.attribute))],
      confidence: Math.max(...evidence.map(e => e.confidence)),
      evidence,
      description: 'Values have been intentionally removed or redacted',
      privacyBenefit: 'medium',
    })
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

function detectHashing(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult
): DetectedTechnique[] {
  const techniques: DetectedTechnique[] = [];
  const evidence: TechniqueEvidence[] = [];

  const hashPatterns = [
    { pattern: /^[a-f0-9]{32}$/i, name: 'MD5 hash', minEntropy: 3.4 },
    { pattern: /^[a-f0-9]{40}$/i, name: 'SHA-1 hash', minEntropy: 3.6 },
    { pattern: /^[a-f0-9]{64}$/i, name: 'SHA-256 hash', minEntropy: 3.8 },
    { pattern: /^[a-f0-9]{128}$/i, name: 'SHA-512 hash', minEntropy: 3.9 },
  ];

  for (const attr of classification.attributes) {
    const colIndex = parsedCSV.headers.indexOf(attr.name);
    if (colIndex === -1) continue;

    const values = parsedCSV.rows.map(row => (row[colIndex] || '').trim()).filter(v => v !== '');
    if (values.length === 0) continue;

    for (const { pattern, name, minEntropy } of hashPatterns) {
      const matchingValues = values.filter(v => pattern.test(v));
      const matchRatio = matchingValues.length / values.length;

      if (matchRatio > 0.8) {
        // Sample up to 10 matching strings to check their entropy
        const sampleSize = Math.min(matchingValues.length, 10);
        let totalEntropy = 0;
        
        for (let i = 0; i < sampleSize; i++) {
          totalEntropy += calculateEntropy(matchingValues[i]);
        }
        
        const avgEntropy = totalEntropy / sampleSize;

        // Only flag as a hash if the entropy is high enough
        if (avgEntropy >= minEntropy) {
          const uniqueMatches = [...new Set(matchingValues)];
          evidence.push({
            attribute: attr.name,
            confidence: Math.min(matchRatio, 0.95),
            evidenceSamples: uniqueMatches.slice(0, 3),
            reason: `${name} detected (${(matchRatio * 100).toFixed(0)}% match, Avg Entropy: ${avgEntropy.toFixed(2)})`,
          });
          break;
        }
      }
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
 * Helper function to check if a detected technique is enabled
 */
function isEnabledTechnique(technique: string, enabled: TechniqueToggle): boolean {
  const techniqueMap: Record<string, keyof TechniqueToggle> = {
    'generalization': 'generalization',
    'suppression': 'suppression',
    'masking': 'masking',
    'hashing': 'hashing',
    'pseudonymization': 'pseudonymization',
    'tokenization': 'tokenization',
    'noise-addition': 'noiseAddition',
    'data-swapping': 'dataSwapping',
  };
  
  const key = techniqueMap[technique];
  return key ? enabled[key] : true;
}

/**
 * Detect privacy-preserving techniques applied to a dataset
 */
function detectPrivacyTechniques(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  minConfidence: number = 0.3,
  generateRecs: boolean = true,
  enabledTechniques: TechniqueToggle = DEFAULT_TECHNIQUE_TOGGLE
): TechniqueDetectionResult {
  const detectedTechniques: DetectedTechnique[] = [];
  const protectedAttributes = new Set<string>();

  // Map technique keys to detection methods
  type DetectionMethod = (csv: ParsedCSV, cls: ClassificationResult) => DetectedTechnique[];
  const detectionMethodsMap: Record<keyof TechniqueToggle, DetectionMethod> = {
    generalization: detectGeneralization,
    suppression: detectSuppression,
    masking: detectMasking,
    hashing: detectHashing,
    pseudonymization: detectPseudonymization,
    tokenization: detectPseudonymization, // Tokenization uses same detection as pseudonymization
    noiseAddition: detectNoiseAddition,
    dataSwapping: detectNoiseAddition, // Data swapping uses similar patterns
  };

  // Run detection methods only for enabled techniques
  const processedMethods = new Set<DetectionMethod>();
  
  for (const [techniqueKey, isEnabled] of Object.entries(enabledTechniques)) {
    if (!isEnabled) continue;
    
    const detectMethod = detectionMethodsMap[techniqueKey as keyof TechniqueToggle];
    if (!detectMethod || processedMethods.has(detectMethod)) continue;
    
    processedMethods.add(detectMethod);
    const results = detectMethod(parsedCSV, classification);
    
    for (const technique of results) {
      // Filter results to only include enabled technique types
      if (technique.confidence > minConfidence && isEnabledTechnique(technique.technique, enabledTechniques)) {
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
      technique: 'noise-addition',
      targetAttributes: unprotectedSA.map(a => a.name),
      priority: 'medium',
      reason: 'Sensitive attributes could benefit from noise addition to prevent inference attacks.',
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

    // Get enabled techniques from the main config or use defaults
    const enabledTechniques = input.config?.enabledTechniques ?? DEFAULT_TECHNIQUE_TOGGLE;

    const result = detectPrivacyTechniques(
      input.parsedCSV,
      input.classification,
      config.minConfidence,
      config.generateRecommendations,
      enabledTechniques
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
