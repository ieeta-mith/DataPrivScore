/**
 * Privacy Index Calculator (Plugin-Based Architecture)
 * 
 * This module provides two ways to calculate privacy metrics:
 * 
 * 1. Plugin-Based (New): Uses the plugin registry to execute all registered
 *    privacy plugins dynamically. This is more flexible and extensible.
 * 
 * 2. Direct (Legacy): Calls each metric calculator directly for backward
 *    compatibility with existing code.
 * 
 * The plugin-based approach allows:
 * - Easy addition of new privacy models
 * - Dynamic enabling/disabling of metrics
 * - Custom weight configurations
 * - Third-party plugin support
 */

import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type {
  PrivacyIndexResult,
  PrivacyMetricScore,
  PrivacyAnalysisConfig,
  PrivacyAnalysisInput,
  RiskLevel,
  ReidentificationRisk,
  RiskFactor,
  PrivacyRecommendation,
  KAnonymityResult,
  LDiversityResult,
  TClosenessResult,
  TechniqueDetectionResult,
} from '@/types/privacy-analysis';
import { DEFAULT_PRIVACY_CONFIG } from '@/types/privacy-analysis';

import {
  getPluginRegistry,
  registerBuiltInPlugins,
  kAnonymityPlugin,
  lDiversityPlugin,
  tClosenessPlugin,
  techniqueDetectionPlugin,
  getKAnonymityViolationDetails,
  getLDiversityInsights,
} from './plugins';
import type { PluginInput, PluginOutput } from './plugins';

// ============================================================================
// Plugin-Based Privacy Index
// ============================================================================

let pluginsInitialized = false;

/**
 * Initialize plugins if not already done
 */
function ensurePluginsInitialized(): void {
  if (!pluginsInitialized) {
    registerBuiltInPlugins();
    pluginsInitialized = true;
  }
}

/**
 * Calculate comprehensive privacy index using the plugin system
 * This is the new recommended way to calculate privacy metrics
 */
export function calculatePrivacyIndexWithPlugins(input: PrivacyAnalysisInput): PrivacyIndexResult {
  ensurePluginsInitialized();
  
  const startTime = performance.now();
  
  const config: PrivacyAnalysisConfig = {
    ...DEFAULT_PRIVACY_CONFIG,
    ...input.config,
  };

  const { parsedCSV, classification } = input;
  
  // Create plugin input
  const pluginInput: PluginInput = {
    parsedCSV,
    classification,
    config,
  };

  // Execute plugins
  const registry = getPluginRegistry();
  
  // Configure weights from config
  registry.setWeightConfiguration({
    'k-anonymity': config.metricWeights.kAnonymity,
    'l-diversity': config.metricWeights.lDiversity,
    't-closeness': config.metricWeights.tCloseness,
    'technique-detection': config.metricWeights.techniqueDetection,
  });

  // Execute all plugins
  const pluginResults = registry.executeAll(pluginInput);

  // Extract individual results
  const kAnonymityOutput = registry.executeOne('k-anonymity', pluginInput) as PluginOutput<KAnonymityResult>;
  const lDiversityOutput = registry.executeOne('l-diversity', pluginInput) as PluginOutput<LDiversityResult>;
  const tClosenessOutput = registry.executeOne('t-closeness', pluginInput) as PluginOutput<TClosenessResult>;
  const techniqueOutput = registry.executeOne('technique-detection', pluginInput) as PluginOutput<TechniqueDetectionResult>;

  const kAnonymity = kAnonymityOutput?.result as KAnonymityResult;
  const lDiversity = lDiversityOutput?.result as LDiversityResult;
  const tCloseness = tClosenessOutput?.result as TClosenessResult;
  const techniqueDetection = techniqueOutput?.result as TechniqueDetectionResult;

  // Calculate re-identification risk
  const reidentificationRisk = calculateReidentificationRisk(
    parsedCSV,
    classification,
    kAnonymity,
    techniqueDetection
  );

  // Build metric scores from plugin results
  const metricScores: PrivacyMetricScore[] = pluginResults.results.map(result => ({
    name: result.pluginName,
    score: result.output.score,
    weight: result.weight,
    weightedScore: result.weightedScore,
    status: result.output.status,
    details: result.output.details,
  }));

  // Add re-identification risk as a separate metric
  const riskScore = 100 - reidentificationRisk.riskScore;
  metricScores.push({
    name: 'Re-identification Risk',
    score: riskScore,
    weight: config.metricWeights.reidentificationRisk,
    weightedScore: riskScore * config.metricWeights.reidentificationRisk,
    status: getMetricStatus(riskScore),
    details: `${reidentificationRisk.riskLevel} risk (${(reidentificationRisk.reidentificationProbability * 100).toFixed(2)}% probability)`,
  });

  // Calculate overall score
  const overallScore = calculateOverallScore(metricScores);
  const riskLevel = getRiskLevel(overallScore);
  const grade = getGrade(overallScore);

  // Generate recommendations
  const recommendations = generateRecommendations(
    kAnonymity,
    lDiversity,
    tCloseness,
    techniqueDetection,
    classification
  );

  const endTime = performance.now();

  return {
    overallScore,
    riskLevel,
    grade,
    metricScores,
    kAnonymity,
    lDiversity,
    tCloseness,
    techniqueDetection,
    reidentificationRisk,
    timestamp: new Date(),
    metadata: {
      recordCount: parsedCSV.rows.length,
      attributeCount: parsedCSV.headers.length,
      classificationSummary: {
        directIdentifiers: classification.summary.directIdentifiers,
        quasiIdentifiers: classification.summary.quasiIdentifiers,
        sensitiveAttributes: classification.summary.sensitiveAttributes,
        nonSensitiveAttributes: classification.summary.nonSensitiveAttributes,
      },
      analysisDuration: endTime - startTime,
      config,
    },
    recommendations,
  };
}

/**
 * Calculate comprehensive privacy index for a dataset (Legacy Direct Method)
 * Maintained for backward compatibility
 */
export function calculatePrivacyIndex(input: PrivacyAnalysisInput): PrivacyIndexResult {
  const startTime = performance.now();
  
  const config: PrivacyAnalysisConfig = {
    ...DEFAULT_PRIVACY_CONFIG,
    ...input.config,
  };

  const { parsedCSV, classification } = input;

  // Create plugin input for direct calculation
  const pluginInput: PluginInput = {
    parsedCSV,
    classification,
    config,
  };

  // Calculate individual metrics using plugins directly
  const kAnonymityOutput = kAnonymityPlugin.calculate(pluginInput);
  const lDiversityOutput = lDiversityPlugin.calculate(pluginInput);
  const tClosenessOutput = tClosenessPlugin.calculate(pluginInput);
  const techniqueOutput = techniqueDetectionPlugin.calculate(pluginInput);

  const kAnonymity = kAnonymityOutput.result;
  const lDiversity = lDiversityOutput.result;
  const tCloseness = tClosenessOutput.result;
  const techniqueDetection = techniqueOutput.result;

  // Calculate re-identification risk
  const reidentificationRisk = calculateReidentificationRisk(
    parsedCSV,
    classification,
    kAnonymity,
    techniqueDetection
  );

  // Calculate metric scores
  const metricScores = calculateMetricScores(
    kAnonymityOutput,
    lDiversityOutput,
    tClosenessOutput,
    techniqueOutput,
    reidentificationRisk,
    config
  );

  // Calculate overall score
  const overallScore = calculateOverallScore(metricScores);

  // Determine risk level and grade
  const riskLevel = getRiskLevel(overallScore);
  const grade = getGrade(overallScore);

  // Generate recommendations
  const recommendations = generateRecommendations(
    kAnonymity,
    lDiversity,
    tCloseness,
    techniqueDetection,
    classification
  );

  const endTime = performance.now();

  return {
    overallScore,
    riskLevel,
    grade,
    metricScores,
    kAnonymity,
    lDiversity,
    tCloseness,
    techniqueDetection,
    reidentificationRisk,
    timestamp: new Date(),
    metadata: {
      recordCount: parsedCSV.rows.length,
      attributeCount: parsedCSV.headers.length,
      classificationSummary: {
        directIdentifiers: classification.summary.directIdentifiers,
        quasiIdentifiers: classification.summary.quasiIdentifiers,
        sensitiveAttributes: classification.summary.sensitiveAttributes,
        nonSensitiveAttributes: classification.summary.nonSensitiveAttributes,
      },
      analysisDuration: endTime - startTime,
      config,
    },
    recommendations,
  };
}

// ============================================================================
// Metric Calculation Helpers
// ============================================================================

/**
 * Calculate metric scores from plugin outputs
 */
function calculateMetricScores(
  kAnonymityOutput: PluginOutput<KAnonymityResult>,
  lDiversityOutput: PluginOutput<LDiversityResult>,
  tClosenessOutput: PluginOutput<TClosenessResult>,
  techniqueOutput: PluginOutput<TechniqueDetectionResult>,
  reidentificationRisk: ReidentificationRisk,
  config: PrivacyAnalysisConfig
): PrivacyMetricScore[] {
  const weights = config.metricWeights;
  const riskScore = 100 - reidentificationRisk.riskScore;

  return [
    {
      name: 'K-Anonymity',
      score: kAnonymityOutput.score,
      weight: weights.kAnonymity,
      weightedScore: kAnonymityOutput.score * weights.kAnonymity,
      status: kAnonymityOutput.status,
      details: kAnonymityOutput.details,
    },
    {
      name: 'L-Diversity',
      score: lDiversityOutput.score,
      weight: weights.lDiversity,
      weightedScore: lDiversityOutput.score * weights.lDiversity,
      status: lDiversityOutput.status,
      details: lDiversityOutput.details,
    },
    {
      name: 'T-Closeness',
      score: tClosenessOutput.score,
      weight: weights.tCloseness,
      weightedScore: tClosenessOutput.score * weights.tCloseness,
      status: tClosenessOutput.status,
      details: tClosenessOutput.details,
    },
    {
      name: 'Privacy Techniques',
      score: techniqueOutput.score,
      weight: weights.techniqueDetection,
      weightedScore: techniqueOutput.score * weights.techniqueDetection,
      status: techniqueOutput.status,
      details: techniqueOutput.details,
    },
    {
      name: 'Re-identification Risk',
      score: riskScore,
      weight: weights.reidentificationRisk,
      weightedScore: riskScore * weights.reidentificationRisk,
      status: getMetricStatus(riskScore),
      details: `${reidentificationRisk.riskLevel} risk (${(reidentificationRisk.reidentificationProbability * 100).toFixed(2)}% probability)`,
    },
  ];
}

/**
 * Calculate overall privacy score from weighted metrics
 */
function calculateOverallScore(metricScores: PrivacyMetricScore[]): number {
  const totalWeightedScore = metricScores.reduce(
    (sum, m) => sum + m.weightedScore,
    0
  );
  return Math.round(totalWeightedScore);
}

/**
 * Get metric status based on score
 */
function getMetricStatus(score: number): 'pass' | 'warning' | 'fail' {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warning';
  return 'fail';
}

/**
 * Get risk level from overall score
 */
function getRiskLevel(score: number): RiskLevel {
  if (score >= 90) return 'minimal';
  if (score >= 70) return 'low';
  if (score >= 50) return 'medium';
  if (score >= 30) return 'high';
  return 'critical';
}

/**
 * Get letter grade from score
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ============================================================================
// Re-identification Risk Calculation
// ============================================================================

/**
 * Calculate re-identification risk assessment
 */
function calculateReidentificationRisk(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  kAnonymity: KAnonymityResult,
  techniqueDetection: TechniqueDetectionResult
): ReidentificationRisk {
  const riskFactors: RiskFactor[] = [];
  let totalRiskImpact = 0;

  // Factor 1: Direct identifiers present
  const directIdentifiers = classification.summary.directIdentifiers;
  const unprotectedDI = directIdentifiers - 
    techniqueDetection.detectedTechniques
      .filter(t => t.technique === 'pseudonymization' || t.technique === 'hashing')
      .flatMap(t => t.affectedAttributes)
      .filter(a => classification.attributes.find(attr => attr.name === a && attr.type === 'direct-identifier'))
      .length;

  if (unprotectedDI > 0) {
    const impact = Math.min(unprotectedDI * 25, 50);
    riskFactors.push({
      factor: 'Unprotected Direct Identifiers',
      impact,
      description: `${unprotectedDI} direct identifier(s) without protection`,
      mitigation: 'Apply pseudonymization or hashing to direct identifiers',
    });
    totalRiskImpact += impact;
  }

  // Factor 2: Low k-anonymity
  if (kAnonymity.kValue < kAnonymity.kThreshold) {
    const impact = Math.min((kAnonymity.kThreshold - kAnonymity.kValue) * 10, 30);
    riskFactors.push({
      factor: 'Insufficient K-Anonymity',
      impact,
      description: `k=${kAnonymity.kValue} is below the recommended threshold of ${kAnonymity.kThreshold}`,
      mitigation: 'Generalize quasi-identifiers or suppress outlier records',
    });
    totalRiskImpact += impact;
  }

  // Factor 3: Unique records
  const uniqueRecords = kAnonymity.violatingClasses.filter(ec => ec.size === 1).length;
  if (uniqueRecords > 0) {
    const uniqueRatio = uniqueRecords / parsedCSV.rows.length;
    const impact = Math.min(uniqueRatio * 100, 25);
    riskFactors.push({
      factor: 'Unique Records',
      impact,
      description: `${uniqueRecords} record(s) are uniquely identifiable (${(uniqueRatio * 100).toFixed(1)}%)`,
      mitigation: 'Suppress or merge unique records with similar ones',
    });
    totalRiskImpact += impact;
  }

  // Factor 4: Many quasi-identifiers
  const quasiCount = classification.summary.quasiIdentifiers;
  if (quasiCount > 5) {
    const impact = Math.min((quasiCount - 5) * 5, 20);
    riskFactors.push({
      factor: 'High Quasi-Identifier Count',
      impact,
      description: `${quasiCount} quasi-identifiers increase linking attack surface`,
      mitigation: 'Reduce quasi-identifiers or apply stronger generalization',
    });
    totalRiskImpact += impact;
  }

  // Factor 5: Low technique coverage
  if (techniqueDetection.techniqueCoverage < 0.3) {
    const impact = (1 - techniqueDetection.techniqueCoverage) * 15;
    riskFactors.push({
      factor: 'Low Privacy Technique Coverage',
      impact,
      description: `Only ${(techniqueDetection.techniqueCoverage * 100).toFixed(0)}% of attributes have detected privacy protections`,
      mitigation: 'Apply additional privacy-preserving techniques to sensitive attributes',
    });
    totalRiskImpact += impact;
  }

  const riskScore = Math.min(Math.round(totalRiskImpact), 100);
  
  // Calculate specific attack risks
  const prosecutorRisk = calculateProsecutorRisk(kAnonymity);
  const journalistRisk = calculateJournalistRisk(kAnonymity, quasiCount);
  const marketerRisk = calculateMarketerRisk(kAnonymity);

  return {
    riskScore,
    riskLevel: getRiskLevel(100 - riskScore),
    reidentificationProbability: calculateReidentificationProbability(kAnonymity),
    riskFactors,
    prosecutorRisk,
    journalistRisk,
    marketerRisk,
  };
}

/**
 * Calculate prosecutor attack risk
 */
function calculateProsecutorRisk(kAnonymity: KAnonymityResult): number {
  if (kAnonymity.kValue <= 0) return 100;
  return Math.min((1 / kAnonymity.kValue) * 100, 100);
}

/**
 * Calculate journalist attack risk
 */
function calculateJournalistRisk(kAnonymity: KAnonymityResult, quasiCount: number): number {
  const baseRisk = calculateProsecutorRisk(kAnonymity);
  return Math.min(baseRisk * 0.7 + quasiCount * 2, 100);
}

/**
 * Calculate marketer attack risk
 */
function calculateMarketerRisk(kAnonymity: KAnonymityResult): number {
  if (kAnonymity.averageClassSize <= 0) return 100;
  return Math.min((1 / kAnonymity.averageClassSize) * 100, 100);
}

/**
 * Calculate estimated re-identification probability
 */
function calculateReidentificationProbability(kAnonymity: KAnonymityResult): number {
  if (kAnonymity.kValue <= 0) return 1;
  const worstCase = 1 / kAnonymity.kValue;
  const avgCase = 1 / kAnonymity.averageClassSize;
  return (worstCase * 0.6 + avgCase * 0.4);
}

// ============================================================================
// Recommendations Generation
// ============================================================================

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(
  kAnonymity: KAnonymityResult,
  lDiversity: LDiversityResult,
  tCloseness: TClosenessResult,
  techniqueDetection: TechniqueDetectionResult,
  classification: ClassificationResult
): PrivacyRecommendation[] {
  const recommendations: PrivacyRecommendation[] = [];
  let id = 1;

  // Critical: Unprotected direct identifiers
  const directIdentifiers = classification.attributes
    .filter(a => a.type === 'direct-identifier')
    .map(a => a.name);
  
  const protectedByTech = new Set(
    techniqueDetection.detectedTechniques.flatMap(t => t.affectedAttributes)
  );
  
  const unprotectedDI = directIdentifiers.filter(a => !protectedByTech.has(a));
  if (unprotectedDI.length > 0) {
    recommendations.push({
      id: `rec-${id++}`,
      priority: 'critical',
      category: 'general',
      title: 'Remove or Protect Direct Identifiers',
      description: `Direct identifiers (${unprotectedDI.join(', ')}) can directly identify individuals and should be removed, hashed, or pseudonymized.`,
      expectedImpact: 25,
      affectedAttributes: unprotectedDI,
      action: 'Apply pseudonymization or cryptographic hashing to these attributes.',
    });
  }

  // High: K-anonymity violations
  if (!kAnonymity.satisfiesKAnonymity) {
    const violationDetails = getKAnonymityViolationDetails(kAnonymity);
    recommendations.push({
      id: `rec-${id++}`,
      priority: 'high',
      category: 'k-anonymity',
      title: 'Improve K-Anonymity',
      description: `Dataset achieves k=${kAnonymity.kValue} but requires k=${kAnonymity.kThreshold}. ${violationDetails.totalViolatingRecords} records are in violating equivalence classes.`,
      expectedImpact: 20,
      affectedAttributes: kAnonymity.quasiIdentifiers,
      action: 'Generalize quasi-identifier values or suppress outlier records.',
    });
  }

  // High: L-diversity violations
  if (!lDiversity.satisfiesLDiversity && lDiversity.sensitiveAttributes.length > 0) {
    const insights = getLDiversityInsights(lDiversity);
    recommendations.push({
      id: `rec-${id++}`,
      priority: 'high',
      category: 'l-diversity',
      title: 'Improve L-Diversity',
      description: `Dataset achieves l=${lDiversity.lValue} diversity but requires l=${lDiversity.lThreshold}. ${insights.vulnerabilities[0] || 'Some equivalence classes lack sensitive value diversity.'}`,
      expectedImpact: 15,
      affectedAttributes: lDiversity.sensitiveAttributes,
      action: 'Apply anatomy or bucketization to sensitive attributes.',
    });
  }

  // Medium: T-closeness violations
  if (!tCloseness.satisfiesTCloseness && tCloseness.sensitiveAttribute) {
    recommendations.push({
      id: `rec-${id++}`,
      priority: 'medium',
      category: 't-closeness',
      title: 'Address Distributional Skew',
      description: `Maximum distributional distance (${tCloseness.maxDistance.toFixed(3)}) exceeds threshold (${tCloseness.tThreshold}). This could enable inference attacks.`,
      expectedImpact: 10,
      affectedAttributes: [tCloseness.sensitiveAttribute],
      action: 'Apply data swapping or noise addition to reduce skew in equivalence classes.',
    });
  }

  // Medium: Technique recommendations
  for (const rec of techniqueDetection.recommendations) {
    recommendations.push({
      id: `rec-${id++}`,
      priority: rec.priority === 'critical' ? 'high' : rec.priority,
      category: 'technique',
      title: `Apply ${formatTechniqueName(rec.technique)}`,
      description: rec.reason,
      expectedImpact: rec.priority === 'critical' ? 15 : rec.priority === 'high' ? 10 : 5,
      affectedAttributes: rec.targetAttributes,
      action: `Apply ${formatTechniqueName(rec.technique)} to: ${rec.targetAttributes.join(', ')}`,
    });
  }

  // Sort by priority and impact
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.expectedImpact - a.expectedImpact;
  });

  return recommendations;
}

/**
 * Format technique name for display
 */
function formatTechniqueName(technique: string): string {
  return technique
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// Re-exports for Backward Compatibility
// ============================================================================

export {
  // From plugins
  kAnonymityPlugin,
  lDiversityPlugin,
  tClosenessPlugin,
  techniqueDetectionPlugin,
  getKAnonymityViolationDetails,
  getLDiversityInsights,
  getTClosenessInsights,
  // Plugin registry
  getPluginRegistry,
  registerBuiltInPlugins,
} from './plugins';

// Re-export direct calculation functions
export {
  calculateKAnonymity,
  calculateKAnonymityScore,
} from '@/services/privacy/plugins/k-anonymity';

export {
  calculateLDiversity,
  calculateLDiversityScore,
} from '@/services/privacy/plugins/l-diversity';

export {
  calculateTCloseness,
  calculateTClosenessScore,
} from '@/services/privacy/plugins/t-closeness';

export {
  detectPrivacyTechniques,
  calculateTechniqueDetectionScore,
} from '@/services/privacy/plugins/technique-detection';
