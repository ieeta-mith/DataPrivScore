import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { 
  TClosenessResult, 
  TClosenessClassResult 
} from '@/types/privacy-analysis';
import type { PrivacyPlugin, PluginInput, PluginOutput, PluginMetadata, MetricStatus } from '@/types/privacy-plugins';

// ============================================================================
// Plugin Configuration
// ============================================================================

export interface TClosenessConfig {
  /** The maximum allowed distance threshold (default: 0.15) */
  tThreshold: number;
}

const DEFAULT_CONFIG: TClosenessConfig = {
  tThreshold: 0.15,
};

// ============================================================================
// Plugin Metadata
// ============================================================================

const metadata: PluginMetadata = {
  id: 't-closeness',
  name: 'T-Closeness',
  description: 'Ensures distribution similarity between equivalence classes and the overall dataset',
  version: '1.0.0',
  category: 'privacy-model',
  defaultWeight: 0.15,
  required: true,
  dependencies: ['l-diversity'], // T-closeness extends l-diversity
  author: 'Privacy Index Calculator',
};

// ============================================================================
// Internal Types
// ============================================================================

interface EquivalenceClassWithSensitiveValues {
  id: string;
  size: number;
  sensitiveValues: string[];
}

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate t-closeness for a dataset
 */
function calculateTCloseness(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  tThreshold: number
): TClosenessResult {
  // Get quasi-identifier and sensitive attribute columns
  const quasiIdentifiers = classification.attributes
    .filter(attr => attr.type === 'quasi-identifier')
    .map(attr => attr.name);

  const sensitiveAttributes = classification.attributes
    .filter(attr => attr.type === 'sensitive');

  // If no sensitive attributes, t-closeness is not applicable
  if (sensitiveAttributes.length === 0) {
    return createEmptyTClosenessResult(tThreshold, '');
  }

  // Use the first sensitive attribute for t-closeness calculation
  const sensitiveAttr = sensitiveAttributes[0];
  const sensitiveIndex = parsedCSV.headers.indexOf(sensitiveAttr.name);

  if (sensitiveIndex === -1) {
    return createEmptyTClosenessResult(tThreshold, sensitiveAttr.name);
  }

  const quasiIndices = quasiIdentifiers.map(name => 
    parsedCSV.headers.indexOf(name)
  ).filter(idx => idx !== -1);

  // Calculate global distribution of sensitive attribute
  const globalDistribution = calculateGlobalDistribution(
    parsedCSV,
    sensitiveIndex
  );

  // Determine if values are numerical or categorical
  const isNumerical = sensitiveAttr.dataPattern === 'numeric';

  // Build equivalence classes and calculate distances
  const equivalenceClasses = buildEquivalenceClassesWithSensitive(
    parsedCSV,
    quasiIndices,
    sensitiveIndex
  );

  const classResults: TClosenessClassResult[] = [];
  const violatingClasses: string[] = [];
  let maxDistance = 0;
  let totalDistance = 0;
  let compliantRecords = 0;
  const totalRecords = parsedCSV.rows.length;

  for (const ec of equivalenceClasses) {
    const localDistribution = calculateLocalDistribution(ec.sensitiveValues);
    
    // Calculate Earth Mover's Distance
    const distance = isNumerical
      ? calculateNumericalEMD(localDistribution, globalDistribution)
      : calculateCategoricalEMD(localDistribution, globalDistribution);

    const satisfiesTCloseness = distance <= tThreshold;

    classResults.push({
      equivalenceClassId: ec.id,
      distance,
      satisfiesTCloseness,
      localDistribution,
    });

    if (distance > maxDistance) {
      maxDistance = distance;
    }
    totalDistance += distance;

    if (!satisfiesTCloseness) {
      violatingClasses.push(ec.id);
    } else {
      compliantRecords += ec.size;
    }
  }

  const complianceRate = totalRecords > 0
    ? (compliantRecords / totalRecords) * 100
    : 0;

  const averageDistance = classResults.length > 0
    ? totalDistance / classResults.length
    : 0;

  return {
    maxDistance,
    satisfiesTCloseness: maxDistance <= tThreshold,
    tThreshold,
    classResults,
    violatingClasses,
    complianceRate,
    globalDistribution,
    sensitiveAttribute: sensitiveAttr.name,
    averageDistance,
  };
}

/**
 * Build equivalence classes with sensitive values
 */
function buildEquivalenceClassesWithSensitive(
  parsedCSV: ParsedCSV,
  quasiIndices: number[],
  sensitiveIndex: number
): EquivalenceClassWithSensitiveValues[] {
  const classMap = new Map<string, EquivalenceClassWithSensitiveValues>();

  parsedCSV.rows.forEach((row) => {
    const keyParts = quasiIndices.map(idx => 
      normalizeValue(row[idx] || '')
    );
    const key = keyParts.join('|||');
    const sensitiveValue = normalizeValue(row[sensitiveIndex] || '');

    if (classMap.has(key)) {
      const ec = classMap.get(key)!;
      ec.size++;
      ec.sensitiveValues.push(sensitiveValue);
    } else {
      classMap.set(key, {
        id: `EC-${classMap.size + 1}`,
        size: 1,
        sensitiveValues: [sensitiveValue],
      });
    }
  });

  return Array.from(classMap.values());
}

/**
 * Calculate global distribution of sensitive attribute
 */
function calculateGlobalDistribution(
  parsedCSV: ParsedCSV,
  sensitiveIndex: number
): Record<string, number> {
  const distribution: Record<string, number> = {};
  const total = parsedCSV.rows.length;

  for (const row of parsedCSV.rows) {
    const value = normalizeValue(row[sensitiveIndex] || '');
    distribution[value] = (distribution[value] || 0) + 1;
  }

  // Convert to probabilities
  for (const key in distribution) {
    distribution[key] /= total;
  }

  return distribution;
}

/**
 * Calculate local distribution within an equivalence class
 */
function calculateLocalDistribution(values: string[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  const total = values.length;

  for (const value of values) {
    distribution[value] = (distribution[value] || 0) + 1;
  }

  // Convert to probabilities
  for (const key in distribution) {
    distribution[key] /= total;
  }

  return distribution;
}

/**
 * Calculate Earth Mover's Distance for categorical attributes
 */
function calculateCategoricalEMD(
  localDist: Record<string, number>,
  globalDist: Record<string, number>
): number {
  const allKeys = new Set([
    ...Object.keys(localDist),
    ...Object.keys(globalDist)
  ]);

  let totalVariation = 0;
  for (const key of allKeys) {
    const localProb = localDist[key] || 0;
    const globalProb = globalDist[key] || 0;
    totalVariation += Math.abs(localProb - globalProb);
  }

  // Return half of total variation (standard EMD for categorical)
  return totalVariation / 2;
}

/**
 * Calculate Earth Mover's Distance for numerical attributes
 */
function calculateNumericalEMD(
  localDist: Record<string, number>,
  globalDist: Record<string, number>
): number {
  // Get all unique values and sort them numerically
  const allValues = Array.from(new Set([
    ...Object.keys(localDist),
    ...Object.keys(globalDist)
  ])).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) {
      return a.localeCompare(b);
    }
    return numA - numB;
  });

  // Calculate CDFs
  let localCDF = 0;
  let globalCDF = 0;
  let totalDistance = 0;

  for (let i = 0; i < allValues.length; i++) {
    const value = allValues[i];
    localCDF += localDist[value] || 0;
    globalCDF += globalDist[value] || 0;
    totalDistance += Math.abs(localCDF - globalCDF);
  }

  // Normalize by number of values
  return totalDistance / Math.max(allValues.length, 1);
}

/**
 * Normalize a value for comparison
 */
function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Create an empty t-closeness result
 */
function createEmptyTClosenessResult(
  tThreshold: number,
  sensitiveAttribute: string
): TClosenessResult {
  return {
    maxDistance: 0,
    satisfiesTCloseness: true,
    tThreshold,
    classResults: [],
    violatingClasses: [],
    complianceRate: 100,
    globalDistribution: {},
    sensitiveAttribute,
    averageDistance: 0,
  };
}

/**
 * Calculate the t-closeness score (0-100)
 */
function calculateScore(result: TClosenessResult): number {
  // If no sensitive attribute, give neutral score
  if (!result.sensitiveAttribute) {
    return 50;
  }

  // Score based on how close the max distance is to the threshold
  const distanceScore = result.maxDistance <= result.tThreshold
    ? 50
    : Math.max(0, 50 - ((result.maxDistance - result.tThreshold) / result.tThreshold) * 50);

  // Add compliance rate contribution
  const complianceScore = (result.complianceRate / 100) * 30;

  // Add average distance bonus (lower is better)
  const avgDistanceScore = Math.max(0, (1 - result.averageDistance) * 20);

  return Math.round(Math.min(distanceScore + complianceScore + avgDistanceScore, 100));
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
function generateInsights(result: TClosenessResult): string[] {
  const insights: string[] = [];

  if (!result.sensitiveAttribute) {
    insights.push('ℹ️ No sensitive attribute classified - t-closeness not applicable');
    return insights;
  }

  if (result.satisfiesTCloseness) {
    insights.push(
      `✓ Max distribution distance: ${result.maxDistance.toFixed(3)} (threshold: ${result.tThreshold})`
    );
  } else {
    insights.push(
      `✗ Max distance ${result.maxDistance.toFixed(3)} exceeds threshold ${result.tThreshold}`
    );
  }

  // Check for high-distance classes
  const highDistanceClasses = result.classResults.filter(
    c => c.distance > result.tThreshold
  );
  if (highDistanceClasses.length > 0) {
    insights.push(
      `⚠️ ${highDistanceClasses.length} class(es) have skewed distributions`
    );
  }

  return insights;
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * T-Closeness Plugin
 */
export const tClosenessPlugin: PrivacyPlugin<TClosenessResult, TClosenessConfig> = {
  metadata,

  calculate(input: PluginInput, pluginConfig?: TClosenessConfig): PluginOutput<TClosenessResult> {
    const config = { ...DEFAULT_CONFIG, ...pluginConfig };
    const threshold = input.config.tThreshold ?? config.tThreshold;

    const result = calculateTCloseness(
      input.parsedCSV,
      input.classification,
      threshold
    );

    const score = calculateScore(result);
    const status = getStatus(score);
    const insights = generateInsights(result);

    return {
      result,
      score,
      status,
      details: `max distance: ${result.maxDistance.toFixed(3)} (threshold: ${threshold})`,
      insights,
    };
  },

  canCalculate(input: PluginInput): boolean {
    return input.parsedCSV.rows.length > 0;
  },

  getDefaultConfig(): TClosenessConfig {
    return { ...DEFAULT_CONFIG };
  },

  validateConfig(config: TClosenessConfig): true | string {
    if (typeof config.tThreshold !== 'number' || config.tThreshold <= 0 || config.tThreshold > 1) {
      return 'tThreshold must be a number between 0 and 1';
    }
    return true;
  },
};

// ============================================================================
// Utility Exports (for backward compatibility)
// ============================================================================

/**
 * Get t-closeness analysis insights
 */
export function getTClosenessInsights(result: TClosenessResult): {
  riskLevel: 'high' | 'medium' | 'low';
  vulnerabilities: string[];
  suggestions: string[];
} {
  const vulnerabilities: string[] = [];
  const suggestions: string[] = [];

  let riskLevel: 'high' | 'medium' | 'low';

  if (result.maxDistance > result.tThreshold * 2) {
    riskLevel = 'high';
    vulnerabilities.push(
      'Significant distributional skew detected in some equivalence classes.'
    );
  } else if (result.maxDistance > result.tThreshold) {
    riskLevel = 'medium';
    vulnerabilities.push(
      `Maximum distance (${result.maxDistance.toFixed(3)}) exceeds threshold (${result.tThreshold}).`
    );
  } else {
    riskLevel = 'low';
  }

  // Check for high-distance classes
  const highDistanceClasses = result.classResults.filter(
    c => c.distance > result.tThreshold
  );
  if (highDistanceClasses.length > 0) {
    vulnerabilities.push(
      `${highDistanceClasses.length} equivalence class(es) have distributional skew that could enable inference attacks.`
    );
  }

  // Suggestions
  if (!result.satisfiesTCloseness) {
    suggestions.push(
      'Apply data swapping or noise addition to sensitive attributes to reduce distributional skew.'
    );
    suggestions.push(
      'Consider generalizing quasi-identifiers to create larger, more diverse equivalence classes.'
    );
  }

  if (result.averageDistance > result.tThreshold / 2) {
    suggestions.push(
      'The average distributional distance is relatively high. Consider applying bucketization to sensitive values.'
    );
  }

  return { riskLevel, vulnerabilities, suggestions };
}

/**
 * Direct calculation function (for backward compatibility)
 */
export { calculateTCloseness, calculateScore as calculateTClosenessScore };

export default tClosenessPlugin;
