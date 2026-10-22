import { 
	detectGeneralization,
	detectSuppression,
	detectMasking,
	detectHashing,
	detectNoiseAddition,
	detectPseudonymization,
	detectBucketing
} from "./techniques"

import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { MetricStatus } from '@/types/privacy-plugins';
import type {
	DetectedTechnique,
	TechniqueDetectionResult,
	TechniqueRecommendation,
	TechniqueDetectionConfig,
	TechniqueKey,
} from './types';

type DetectionMethod = (
    csv: ParsedCSV,
    cls: ClassificationResult
) => DetectedTechnique[];

export function detectPrivacyTechniques(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  config: TechniqueDetectionConfig
): TechniqueDetectionResult {
  const detectedTechniques: DetectedTechnique[] = [];
  const unverifiedTechniques: string[] = [];
  const protectedAttributes = new Set<string>();

  const detectionMethodsMap: Record<TechniqueKey, (csv: ParsedCSV, cls: ClassificationResult) => DetectedTechnique[]> = {
    generalization: detectGeneralization,
    suppression: detectSuppression,
    masking: detectMasking,
    hashing: detectHashing,
    noiseAddition: detectNoiseAddition,
		pseudonymization: detectPseudonymization,
		bucketing: detectBucketing,
  };

  const processedMethods = new Set<DetectionMethod>();
  const hasDeclarations = Object.values(config.enabledTechniques).some(Boolean);

  for (const [techniqueKey, detectMethod] of Object.entries(detectionMethodsMap)) {
    const isDeclared = config.enabledTechniques[techniqueKey as TechniqueKey];

    // ROUTING: If declarations exist, only verify selected. Else, auto-detect all.
    if (hasDeclarations && !isDeclared) continue;
    if (processedMethods.has(detectMethod)) continue;

    processedMethods.add(detectMethod);
    const results = detectMethod(parsedCSV, classification);
    let wasVerified = false;

    for (const technique of results) {
      if (technique.confidence >= config.minConfidence) {
        detectedTechniques.push(technique);
        technique.affectedAttributes.forEach(attr => protectedAttributes.add(attr));
        wasVerified = true;
      }
    }

    if (hasDeclarations && isDeclared && !wasVerified) {
      unverifiedTechniques.push(techniqueKey);
    }
  }

  let totalRiskWeight = 0;
  let protectedRiskWeight = 0;
  const totalRows = Math.max(1, parsedCSV.rows.length);

  const getAttributeWeight = (attrName: string): number => {
    const colIndex = parsedCSV.headers.indexOf(attrName);
    if (colIndex === -1) return 0;
    const uniqueValues = new Set(parsedCSV.rows.map(r => r[colIndex]));
    return uniqueValues.size / totalRows;
  };

  classification.attributes.forEach(attr => {
    if (attr.type === 'direct-identifier' || attr.type === 'quasi-identifier') {
      const dynamicWeight = getAttributeWeight(attr.name);
      totalRiskWeight += dynamicWeight;

      if (protectedAttributes.has(attr.name)) {
        protectedRiskWeight += dynamicWeight;
      }
    }
  });

  const techniqueScore = totalRiskWeight > 0 
    ? Math.round(100 * (protectedRiskWeight / totalRiskWeight)) 
    : 100;

  const totalAttributes = classification.attributes.length;
  const techniqueCoverage = totalAttributes > 0 ? protectedAttributes.size / totalAttributes : 0;

  return {
    detectedTechniques,
    unverifiedTechniques,
    techniqueCoverage,
    protectedAttributeCount: protectedAttributes.size,
    totalAttributes,
    techniqueScore,
    recommendations: config.generateRecommendations ? generateRecommendations(classification, protectedAttributes) : [],
  };
}

export function getStatus(score: number): MetricStatus {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warning';
  return 'fail';
}

function generateRecommendations(
  classification: ClassificationResult,
  protectedAttributes: Set<string>
): TechniqueRecommendation[] {
  const recommendations: TechniqueRecommendation[] = [];

  const unprotectedDI = classification.attributes
    .filter(a => a.type === 'direct-identifier' && !protectedAttributes.has(a.name));
  if (unprotectedDI.length > 0) {
    recommendations.push({
      technique: 'suppression',
      targetAttributes: unprotectedDI.map(a => a.name),
      priority: 'critical',
      reason: 'Direct identifiers should be masked, hashed, or fully suppressed.',
    });
  }

  const unprotectedQI = classification.attributes
    .filter(a => a.type === 'quasi-identifier' && !protectedAttributes.has(a.name));
  if (unprotectedQI.length > 0) {
    recommendations.push({
      technique: 'generalization',
      targetAttributes: unprotectedQI.map(a => a.name),
      priority: 'high',
      reason: 'Quasi-identifiers should be generalized to protect against linkage attacks.',
    });
  }

  return recommendations;
}

