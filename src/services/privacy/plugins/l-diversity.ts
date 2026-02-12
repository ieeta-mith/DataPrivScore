import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { 
  LDiversityResult, 
  LDiversityClassResult, 
  LDiversityType
} from '@/types/privacy-analysis';
import type { PrivacyPlugin, PluginInput, PluginOutput, PluginMetadata, MetricStatus } from '@/types/privacy-plugins';

// ============================================================================
// Plugin Configuration
// ============================================================================

export interface LDiversityConfig {
  /** The minimum l value to consider as compliant (default: 2) */
  lThreshold: number;
  /** Type of l-diversity calculation */
  diversityType: LDiversityType;
}

const DEFAULT_CONFIG: LDiversityConfig = {
  lThreshold: 2,
  diversityType: 'distinct',
};

// ============================================================================
// Plugin Metadata
// ============================================================================

const metadata: PluginMetadata = {
  id: 'l-diversity',
  name: 'L-Diversity',
  description: 'Ensures diversity in sensitive attributes within equivalence classes',
  version: '1.0.0',
  category: 'privacy-model',
  defaultWeight: 0.20,
  required: true,
  author: 'Privacy Index Calculator',
};

// ============================================================================
// Internal Types
// ============================================================================

interface EquivalenceClassWithSensitive {
  id: string;
  quasiValues: string;
  size: number;
  sensitiveValues: string[];
}

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate l-diversity for a dataset
 */
function calculateLDiversity(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  lThreshold: number,
  diversityType: LDiversityType
): LDiversityResult {
  // Get quasi-identifier and sensitive attribute columns
  const quasiIdentifiers = classification.attributes
    .filter(attr => attr.type === 'quasi-identifier')
    .map(attr => attr.name);

  const sensitiveAttributes = classification.attributes
    .filter(attr => attr.type === 'sensitive')
    .map(attr => attr.name);

  // If no sensitive attributes, l-diversity is not applicable
  if (sensitiveAttributes.length === 0) {
    return createEmptyLDiversityResult(lThreshold, diversityType, sensitiveAttributes);
  }

  const quasiIndices = quasiIdentifiers.map(name => 
    parsedCSV.headers.indexOf(name)
  ).filter(idx => idx !== -1);

  const sensitiveIndices = sensitiveAttributes.map(name =>
    parsedCSV.headers.indexOf(name)
  ).filter(idx => idx !== -1);

  // Build equivalence classes with sensitive values
  const equivalenceClasses = buildEquivalenceClassesWithSensitive(
    parsedCSV,
    quasiIndices,
    sensitiveIndices
  );

  // Calculate l-diversity for each class
  const classResults: LDiversityClassResult[] = [];
  const violatingClasses: string[] = [];
  let minL = Infinity;
  let totalEntropy = 0;
  let compliantRecords = 0;
  const totalRecords = parsedCSV.rows.length;

  for (const ec of equivalenceClasses) {
    const result = calculateClassLDiversity(
      ec,
      lThreshold,
      diversityType
    );
    classResults.push(result);

    const classL = result.distinctCount;
    if (classL < minL) {
      minL = classL;
    }

    totalEntropy += result.entropy;

    if (!result.satisfiesLDiversity) {
      violatingClasses.push(result.equivalenceClassId);
    } else {
      compliantRecords += ec.size;
    }
  }

  const complianceRate = totalRecords > 0
    ? (compliantRecords / totalRecords) * 100
    : 0;

  const averageEntropy = classResults.length > 0
    ? totalEntropy / classResults.length
    : 0;

  return {
    lValue: minL === Infinity ? 0 : minL,
    satisfiesLDiversity: minL >= lThreshold,
    lThreshold,
    diversityType,
    classResults,
    violatingClasses,
    complianceRate,
    sensitiveAttributes,
    averageEntropy,
  };
}

/**
 * Build equivalence classes with their sensitive attribute values
 */
function buildEquivalenceClassesWithSensitive(
  parsedCSV: ParsedCSV,
  quasiIndices: number[],
  sensitiveIndices: number[]
): EquivalenceClassWithSensitive[] {
  const classMap = new Map<string, EquivalenceClassWithSensitive>();

  parsedCSV.rows.forEach((row) => {
    // Create key from quasi-identifier values
    const keyParts = quasiIndices.map(idx => 
      normalizeValue(row[idx] || '')
    );
    const key = keyParts.join('|||');

    // Combine all sensitive values into one for analysis
    const sensitiveValue = sensitiveIndices
      .map(idx => normalizeValue(row[idx] || ''))
      .join('|');

    if (classMap.has(key)) {
      const ec = classMap.get(key)!;
      ec.size++;
      ec.sensitiveValues.push(sensitiveValue);
    } else {
      classMap.set(key, {
        id: `EC-${classMap.size + 1}`,
        quasiValues: key,
        size: 1,
        sensitiveValues: [sensitiveValue],
      });
    }
  });

  return Array.from(classMap.values());
}

/**
 * Calculate l-diversity for a single equivalence class
 */
function calculateClassLDiversity(
  ec: EquivalenceClassWithSensitive,
  lThreshold: number,
  diversityType: LDiversityType
): LDiversityClassResult {
  // Calculate distribution of sensitive values
  const distribution: Record<string, number> = {};
  for (const value of ec.sensitiveValues) {
    distribution[value] = (distribution[value] || 0) + 1;
  }

  const distinctCount = Object.keys(distribution).length;
  const entropy = calculateEntropy(distribution, ec.size);

  let satisfiesLDiversity: boolean;

  switch (diversityType) {
    case 'distinct':
      satisfiesLDiversity = distinctCount >= lThreshold;
      break;
    case 'entropy':
      // Entropy l-diversity requires entropy >= log(l)
      satisfiesLDiversity = entropy >= Math.log2(lThreshold);
      break;
    case 'recursive':
      // Recursive (c,l)-diversity with c=2
      satisfiesLDiversity = checkRecursiveLDiversity(distribution, lThreshold, 2);
      break;
    default:
      satisfiesLDiversity = distinctCount >= lThreshold;
  }

  return {
    equivalenceClassId: ec.id,
    distinctCount,
    entropy,
    satisfiesLDiversity,
    sensitiveValueDistribution: distribution,
  };
}

/**
 * Calculate Shannon entropy of a distribution
 */
function calculateEntropy(distribution: Record<string, number>, total: number): number {
  if (total === 0) return 0;

  let entropy = 0;
  for (const count of Object.values(distribution)) {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

/**
 * Check recursive (c,l)-diversity
 */
function checkRecursiveLDiversity(
  distribution: Record<string, number>,
  l: number,
  c: number
): boolean {
  const frequencies = Object.values(distribution).sort((a, b) => b - a);
  
  if (frequencies.length < l) {
    return false;
  }

  const mostFrequent = frequencies[0];
  const remainingSum = frequencies.slice(1).reduce((sum, f) => sum + f, 0);

  return mostFrequent < c * remainingSum;
}

/**
 * Normalize a value for comparison
 */
function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Create an empty l-diversity result when no sensitive attributes exist
 */
function createEmptyLDiversityResult(
  lThreshold: number,
  diversityType: LDiversityType,
  sensitiveAttributes: string[]
): LDiversityResult {
  return {
    lValue: 0,
    satisfiesLDiversity: true, // Trivially satisfied when no sensitive data
    lThreshold,
    diversityType,
    classResults: [],
    violatingClasses: [],
    complianceRate: 100,
    sensitiveAttributes,
    averageEntropy: 0,
  };
}

/**
 * Calculate the l-diversity score (0-100)
 */
function calculateScore(result: LDiversityResult): number {
  // If no sensitive attributes, give neutral score
  if (result.sensitiveAttributes.length === 0) {
    return 50;
  }

  // Base score on the l-value achieved
  const lScore = Math.min(result.lValue / result.lThreshold, 1) * 40;
  
  // Add compliance rate contribution
  const complianceScore = (result.complianceRate / 100) * 35;
  
  // Add entropy bonus (higher entropy = better diversity)
  const maxExpectedEntropy = Math.log2(result.lThreshold * 2);
  const entropyScore = Math.min(result.averageEntropy / maxExpectedEntropy, 1) * 25;

  return Math.round(Math.min(lScore + complianceScore + entropyScore, 100));
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
function generateInsights(result: LDiversityResult): string[] {
  const insights: string[] = [];

  if (result.sensitiveAttributes.length === 0) {
    insights.push('ℹ️ No sensitive attributes classified - l-diversity not applicable');
    return insights;
  }

  if (result.satisfiesLDiversity) {
    insights.push(
      `✓ Dataset achieves ${result.lValue}-diversity (threshold: ${result.lThreshold})`
    );
  } else {
    insights.push(
      `✗ l=${result.lValue} is below the threshold of ${result.lThreshold}`
    );
  }

  // Check for homogeneous classes (l=1)
  const homogeneousClasses = result.classResults.filter(c => c.distinctCount === 1);
  if (homogeneousClasses.length > 0) {
    insights.push(
      `⚠️ ${homogeneousClasses.length} class(es) have homogeneous sensitive values (high risk)`
    );
  }

  // Check for low entropy classes
  const lowEntropyClasses = result.classResults.filter(
    c => c.entropy < 1 && c.distinctCount > 1
  );
  if (lowEntropyClasses.length > 0) {
    insights.push(
      `⚠️ ${lowEntropyClasses.length} class(es) have skewed sensitive value distributions`
    );
  }

  return insights;
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * L-Diversity Plugin
 */
export const lDiversityPlugin: PrivacyPlugin<LDiversityResult, LDiversityConfig> = {
  metadata,

  calculate(input: PluginInput, pluginConfig?: LDiversityConfig): PluginOutput<LDiversityResult> {
    const config = { ...DEFAULT_CONFIG, ...pluginConfig };
    const threshold = input.config.lThreshold ?? config.lThreshold;
    const diversityType = input.config.lDiversityType ?? config.diversityType;

    const result = calculateLDiversity(
      input.parsedCSV,
      input.classification,
      threshold,
      diversityType
    );

    const score = calculateScore(result);
    const status = getStatus(score);
    const insights = generateInsights(result);

    return {
      result,
      score,
      status,
      details: `l=${result.lValue} (threshold: ${threshold}), ${result.complianceRate.toFixed(1)}% compliant`,
      insights,
    };
  },

  canCalculate(input: PluginInput): boolean {
    return input.parsedCSV.rows.length > 0;
  },

  getDefaultConfig(): LDiversityConfig {
    return { ...DEFAULT_CONFIG };
  },

  validateConfig(config: LDiversityConfig): true | string {
    if (typeof config.lThreshold !== 'number' || config.lThreshold < 1) {
      return 'lThreshold must be a positive number';
    }
    if (!['distinct', 'entropy', 'recursive'].includes(config.diversityType)) {
      return 'diversityType must be one of: distinct, entropy, recursive';
    }
    return true;
  },
};

// ============================================================================
// Utility Exports (for backward compatibility)
// ============================================================================

/**
 * Get l-diversity analysis insights
 */
export function getLDiversityInsights(result: LDiversityResult): {
  riskLevel: 'high' | 'medium' | 'low';
  vulnerabilities: string[];
  suggestions: string[];
} {
  const vulnerabilities: string[] = [];
  const suggestions: string[] = [];

  let riskLevel: 'high' | 'medium' | 'low';

  if (result.lValue <= 1) {
    riskLevel = 'high';
    vulnerabilities.push(
      'Some equivalence classes have only one unique sensitive value, enabling attribute disclosure.'
    );
  } else if (result.lValue < result.lThreshold) {
    riskLevel = 'medium';
    vulnerabilities.push(
      `Dataset achieves ${result.lValue}-diversity but requires ${result.lThreshold}-diversity.`
    );
  } else {
    riskLevel = 'low';
  }

  // Check for low entropy classes
  const lowEntropyClasses = result.classResults.filter(
    c => c.entropy < 1 && c.distinctCount > 1
  );
  if (lowEntropyClasses.length > 0) {
    vulnerabilities.push(
      `${lowEntropyClasses.length} equivalence class(es) have low entropy, indicating skewed sensitive value distributions.`
    );
  }

  // Suggestions
  if (result.lValue < result.lThreshold) {
    suggestions.push(
      'Apply bucketization or anatomy techniques to increase diversity in sensitive attributes.'
    );
  }

  if (result.averageEntropy < Math.log2(result.lThreshold)) {
    suggestions.push(
      'Consider using entropy l-diversity as the criterion for a stronger privacy guarantee.'
    );
  }

  if (result.violatingClasses.length > 0) {
    suggestions.push(
      `Address the ${result.violatingClasses.length} violating equivalence class(es) by generalizing quasi-identifiers.`
    );
  }

  return { riskLevel, vulnerabilities, suggestions };
}

/**
 * Direct calculation function (for backward compatibility)
 */
export { calculateLDiversity, calculateScore as calculateLDiversityScore };

export default lDiversityPlugin;
