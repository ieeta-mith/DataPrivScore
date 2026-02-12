import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { EquivalenceClass, KAnonymityResult } from '@/types/privacy-analysis';
import type { PrivacyPlugin, PluginInput, PluginOutput, PluginMetadata, MetricStatus } from '@/types/privacy-plugins';

// ============================================================================
// Plugin Configuration
// ============================================================================

export interface KAnonymityConfig {
  /** The minimum k value to consider as compliant (default: 5) */
  kThreshold: number;
}

const DEFAULT_CONFIG: KAnonymityConfig = {
  kThreshold: 5,
};

// ============================================================================
// Plugin Metadata
// ============================================================================

const metadata: PluginMetadata = {
  id: 'k-anonymity',
  name: 'K-Anonymity',
  description: 'Ensures each record is indistinguishable from at least k-1 others based on quasi-identifiers',
  version: '1.0.0',
  category: 'privacy-model',
  defaultWeight: 0.25,
  required: true,
  author: 'Privacy Index Calculator',
};

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate k-anonymity for a dataset
 */
function calculateKAnonymity(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  kThreshold: number
): KAnonymityResult {
  // Get quasi-identifier column indices
  const quasiIdentifiers = classification.attributes
    .filter(attr => attr.type === 'quasi-identifier')
    .map(attr => attr.name);

  const quasiIndices = quasiIdentifiers.map(name => 
    parsedCSV.headers.indexOf(name)
  ).filter(idx => idx !== -1);

  // If no quasi-identifiers, the dataset trivially satisfies any k-anonymity
  if (quasiIndices.length === 0) {
    return {
      kValue: parsedCSV.rows.length,
      satisfiesKAnonymity: true,
      kThreshold,
      equivalenceClassCount: 1,
      sizeDistribution: { [parsedCSV.rows.length]: 1 },
      violatingClasses: [],
      complianceRate: 100,
      averageClassSize: parsedCSV.rows.length,
      quasiIdentifiers: [],
    };
  }

  // Build equivalence classes
  const equivalenceClasses = buildEquivalenceClasses(
    parsedCSV,
    quasiIndices,
    quasiIdentifiers
  );

  // Calculate statistics
  const sizeDistribution: Record<number, number> = {};
  let minSize = Infinity;
  const violatingClasses: EquivalenceClass[] = [];
  let compliantRecords = 0;

  for (const ec of equivalenceClasses) {
    sizeDistribution[ec.size] = (sizeDistribution[ec.size] || 0) + 1;
    
    if (ec.size < minSize) {
      minSize = ec.size;
    }

    if (ec.size < kThreshold) {
      violatingClasses.push(ec);
    } else {
      compliantRecords += ec.size;
    }
  }

  const totalRecords = parsedCSV.rows.length;
  const complianceRate = totalRecords > 0 
    ? (compliantRecords / totalRecords) * 100 
    : 0;

  const averageClassSize = equivalenceClasses.length > 0
    ? totalRecords / equivalenceClasses.length
    : 0;

  return {
    kValue: minSize === Infinity ? 0 : minSize,
    satisfiesKAnonymity: minSize >= kThreshold,
    kThreshold,
    equivalenceClassCount: equivalenceClasses.length,
    sizeDistribution,
    violatingClasses,
    complianceRate,
    averageClassSize,
    quasiIdentifiers,
  };
}

/**
 * Build equivalence classes from quasi-identifier values
 */
function buildEquivalenceClasses(
  parsedCSV: ParsedCSV,
  quasiIndices: number[],
  quasiIdentifierNames: string[]
): EquivalenceClass[] {
  const classMap = new Map<string, EquivalenceClass>();

  parsedCSV.rows.forEach((row, rowIndex) => {
    // Create a key from quasi-identifier values
    const values: Record<string, string> = {};
    const keyParts: string[] = [];

    quasiIndices.forEach((colIndex, i) => {
      const value = normalizeValue(row[colIndex] || '');
      values[quasiIdentifierNames[i]] = value;
      keyParts.push(value);
    });

    const key = keyParts.join('|||');

    if (classMap.has(key)) {
      const ec = classMap.get(key)!;
      ec.size++;
      ec.rowIndices.push(rowIndex);
    } else {
      classMap.set(key, {
        id: `EC-${classMap.size + 1}`,
        quasiIdentifierValues: values,
        size: 1,
        rowIndices: [rowIndex],
      });
    }
  });

  return Array.from(classMap.values());
}

/**
 * Normalize a value for comparison
 */
function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Calculate the k-anonymity score (0-100)
 */
function calculateScore(result: KAnonymityResult): number {
  // Base score on the k-value achieved
  const kScore = Math.min(result.kValue / result.kThreshold, 1) * 50;
  
  // Add compliance rate contribution
  const complianceScore = (result.complianceRate / 100) * 30;
  
  // Add penalty for having many small classes
  const avgClassPenalty = result.averageClassSize < result.kThreshold
    ? (result.averageClassSize / result.kThreshold) * 20
    : 20;

  return Math.round(Math.min(kScore + complianceScore + avgClassPenalty, 100));
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
function generateInsights(result: KAnonymityResult): string[] {
  const insights: string[] = [];

  const uniqueRecords = result.violatingClasses.filter(ec => ec.size === 1).length;
  
  if (uniqueRecords > 0) {
    insights.push(
      `⚠️ ${uniqueRecords} record(s) are uniquely identifiable and at high risk`
    );
  }

  if (result.satisfiesKAnonymity) {
    insights.push(
      `✓ Dataset achieves k=${result.kValue} anonymity (threshold: ${result.kThreshold})`
    );
  } else {
    insights.push(
      `✗ k=${result.kValue} is below the threshold of ${result.kThreshold}`
    );
  }

  if (result.quasiIdentifiers.length > 5) {
    insights.push(
      `⚠️ High number of quasi-identifiers (${result.quasiIdentifiers.length}) increases re-identification risk`
    );
  }

  return insights;
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * K-Anonymity Plugin
 */
export const kAnonymityPlugin: PrivacyPlugin<KAnonymityResult, KAnonymityConfig> = {
  metadata,

  calculate(input: PluginInput, pluginConfig?: KAnonymityConfig): PluginOutput<KAnonymityResult> {
    const config = { ...DEFAULT_CONFIG, ...pluginConfig };
    const threshold = input.config.kThreshold ?? config.kThreshold;

    const result = calculateKAnonymity(
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
      details: `k=${result.kValue} (threshold: ${threshold}), ${result.complianceRate.toFixed(1)}% compliant`,
      insights,
    };
  },

  canCalculate(input: PluginInput): boolean {
    // K-anonymity requires parsed CSV data
    return input.parsedCSV.rows.length > 0;
  },

  getDefaultConfig(): KAnonymityConfig {
    return { ...DEFAULT_CONFIG };
  },

  validateConfig(config: KAnonymityConfig): true | string {
    if (typeof config.kThreshold !== 'number' || config.kThreshold < 1) {
      return 'kThreshold must be a positive number';
    }
    return true;
  },
};

// ============================================================================
// Utility Exports (for backward compatibility)
// ============================================================================

/**
 * Get detailed information about violating equivalence classes
 */
export function getKAnonymityViolationDetails(
  result: KAnonymityResult
): {
  totalViolatingRecords: number;
  uniqueRecords: number;
  riskLevel: 'high' | 'medium' | 'low';
  suggestions: string[];
} {
  const totalViolatingRecords = result.violatingClasses.reduce(
    (sum, ec) => sum + ec.size,
    0
  );

  const uniqueRecords = result.violatingClasses.filter(ec => ec.size === 1).length;

  let riskLevel: 'high' | 'medium' | 'low';
  if (result.kValue <= 2) {
    riskLevel = 'high';
  } else if (result.kValue < result.kThreshold) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  const suggestions: string[] = [];

  if (uniqueRecords > 0) {
    suggestions.push(
      `Consider suppressing or generalizing the ${uniqueRecords} unique record(s) that can be individually identified.`
    );
  }

  if (result.quasiIdentifiers.length > 3) {
    suggestions.push(
      'Reducing the number of quasi-identifiers or generalizing some attributes would increase k-values.'
    );
  }

  if (result.kValue < result.kThreshold) {
    suggestions.push(
      `Apply generalization to quasi-identifiers to achieve k=${result.kThreshold} anonymity.`
    );
  }

  return {
    totalViolatingRecords,
    uniqueRecords,
    riskLevel,
    suggestions,
  };
}

/**
 * Direct calculation function (for backward compatibility)
 */
export { calculateKAnonymity, calculateScore as calculateKAnonymityScore };

export default kAnonymityPlugin;
