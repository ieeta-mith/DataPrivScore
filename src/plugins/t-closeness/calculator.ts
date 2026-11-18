import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { MetricStatus } from '@/types/privacy-plugins';
import type { TClosenessResult, AttributeTClosenessResult } from './types';

function calculateCategoricalEMD(
  localDist: Record<string, number>,
  globalDist: Record<string, number>
): number {
  const allCategories = new Set([...Object.keys(localDist), ...Object.keys(globalDist)]);
  let totalVariation = 0;

  for (const key of allCategories) {
    const p_i = globalDist[key] || 0;
    const q_i = localDist[key] || 0;
    totalVariation += Math.abs(p_i - q_i);
  }

  return totalVariation / 2;
}

function calculateNumericalEMD(
  localDist: Record<string, number>,
  globalDist: Record<string, number>
): number {
  const allValues = Array.from(new Set([
    ...Object.keys(localDist),
    ...Object.keys(globalDist)
  ])).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
    return numA - numB;
  });

  const n = allValues.length;
  if (n <= 1) return 0;

  let localCDF = 0;
  let globalCDF = 0;
  let totalDistance = 0;

  for (let i = 0; i < n; i++) {
    const value = allValues[i];
    localCDF += localDist[value] || 0;
    globalCDF += globalDist[value] || 0;
    totalDistance += Math.abs(localCDF - globalCDF);
  }

  return totalDistance / (n - 1);
}

export function calculateTCloseness(
  parsedCSV: ParsedCSV,
  classification: ClassificationResult,
  tThreshold: number
): TClosenessResult {
  const quasiIdentifiers = classification.attributes
    .filter(attr => attr.type === 'quasi-identifier')
    .map(attr => attr.name);

  const sensitiveAttributes = classification.attributes
    .filter(attr => attr.type === 'sensitive');

  if (sensitiveAttributes.length === 0) {
    return {
      maxDistance: 0,
      satisfiesTCloseness: true,
      tThreshold,
      complianceRate: 100,
      averageDistance: 0,
      sensitiveAttributes: [],
      attributeResults: {},
      violatingClasses: [],
    };
  }

  const quasiIndices = quasiIdentifiers.map(name => 
    parsedCSV.headers.indexOf(name)
  ).filter(index => index !== -1);

  const equivalenceClasses = buildEquivalenceClasses(parsedCSV, quasiIndices);
  const totalRecords = parsedCSV.rows.length;

  let globalMaxDistance = 0;
  let totalAvgDistance = 0;
  let worstComplianceRate = 100;
  
  const attributeResults: Record<string, AttributeTClosenessResult> = {};
  const allViolatingClasses = new Set<string>();

  for (const sensitiveAttr of sensitiveAttributes) {
    const sensitiveIndex = parsedCSV.headers.indexOf(sensitiveAttr.name);
    if (sensitiveIndex === -1) continue;

    const isNumerical = sensitiveAttr.dataPattern === 'numeric';
    const globalDistribution = calculateGlobalDistribution(parsedCSV, sensitiveIndex);
    
    let attrMaxDistance = 0;
    let attrTotalDistance = 0;
    let compliantRecords = 0;
    const violatingClasses: string[] = [];

    for (const ec of equivalenceClasses) {
      const localDistribution = calculateLocalDistribution(parsedCSV, ec.rowIndices, sensitiveIndex);
      
      const distance = isNumerical
        ? calculateNumericalEMD(localDistribution, globalDistribution)
        : calculateCategoricalEMD(localDistribution, globalDistribution);

      if (distance > attrMaxDistance) attrMaxDistance = distance;
      attrTotalDistance += distance;

      if (distance > tThreshold) {
        violatingClasses.push(ec.id);
        allViolatingClasses.add(ec.id);
      } else {
        compliantRecords += ec.size;
      }
    }

    const attrComplianceRate = totalRecords > 0 ? (compliantRecords / totalRecords) * 100 : 0;
    const attrAvgDistance = equivalenceClasses.length > 0 ? attrTotalDistance / equivalenceClasses.length : 0;

    attributeResults[sensitiveAttr.name] = {
      maxDistance: attrMaxDistance,
      averageDistance: attrAvgDistance,
      satisfiesTCloseness: attrMaxDistance <= tThreshold,
      complianceRate: attrComplianceRate,
      globalDistribution,
      violatingClasses,
    };

    if (attrMaxDistance > globalMaxDistance) globalMaxDistance = attrMaxDistance;
    totalAvgDistance += attrAvgDistance;
    if (attrComplianceRate < worstComplianceRate) worstComplianceRate = attrComplianceRate;
  }

  const activeSensitiveCount = Object.keys(attributeResults).length;
  if (activeSensitiveCount === 0) {
    return { maxDistance: 0, satisfiesTCloseness: true, tThreshold, complianceRate: 100, sensitiveAttributes: [], averageDistance: 0, attributeResults: {}, violatingClasses: [] };
  }

  return {
    maxDistance: globalMaxDistance,
    satisfiesTCloseness: globalMaxDistance <= tThreshold,
    tThreshold,
    complianceRate: worstComplianceRate,
    sensitiveAttributes: Object.keys(attributeResults),
    averageDistance: totalAvgDistance / activeSensitiveCount,
    attributeResults,
    violatingClasses: Array.from(allViolatingClasses),
  };
}

interface EquivalenceClassRows {
  id: string;
  size: number;
  rowIndices: number[];
}

function buildEquivalenceClasses(
  parsedCSV: ParsedCSV,
  quasiIndices: number[]
): EquivalenceClassRows[] {
  const classMap = new Map<string, EquivalenceClassRows>();

  parsedCSV.rows.forEach((row, rowIndex) => {
    const keyParts = quasiIndices.map(idx => normalizeValue(row[idx] || ''));
    const key = keyParts.join('|||');

    if (classMap.has(key)) {
      const ec = classMap.get(key)!;
      ec.size++;
      ec.rowIndices.push(rowIndex);
    } else {
      classMap.set(key, {
        id: `EC-${classMap.size + 1}`,
        size: 1,
        rowIndices: [rowIndex],
      });
    }
  });

  return Array.from(classMap.values());
}

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

  for (const key in distribution) {
    distribution[key] /= total;
  }

  return distribution;
}

function calculateLocalDistribution(
  parsedCSV: ParsedCSV,
  rowIndices: number[],
  sensitiveIndex: number
): Record<string, number> {
  const distribution: Record<string, number> = {};
  const total = rowIndices.length;

  for (const rowIndex of rowIndices) {
    const value = normalizeValue(parsedCSV.rows[rowIndex][sensitiveIndex] || '');
    distribution[value] = (distribution[value] || 0) + 1;
  }

  for (const key in distribution) {
    distribution[key] /= total;
  }

  return distribution;
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function calculateScore(result: TClosenessResult): number {
  const attributes = Object.values(result.attributeResults);
  
  if (attributes.length === 0) return 100;

  let totalScore = 0;
  let hasViolation = false;

  for (const attr of attributes) {
    const dMax = attr.maxDistance;
    const dAvg = attr.averageDistance;
    const tThreshold = result.tThreshold;
    const cr = attr.complianceRate / 100;

    const excess = Math.max(0, dMax - tThreshold);
    const mMax = 1 - (excess / (1 - tThreshold));

    const sT = 100 * cr * 0.5 * (mMax + (1 - dAvg));
    
    totalScore += sT;

    if (dMax > tThreshold) {
      hasViolation = true;
    }
  }

  let finalScore = totalScore / attributes.length;

  if (hasViolation) {
    finalScore = finalScore * 0.69;
  }

  return Math.round(Math.max(0, Math.min(100, finalScore)));
}

export function getStatus(score: number): MetricStatus {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warning';
  return 'fail';
}

export function generateInsights(result: TClosenessResult): string[] {
  const insights: string[] = [];

  if (result.sensitiveAttributes.length === 0) {
    insights.push('No sensitive attributes classified - t-closeness not applicable');
    return insights;
  }

  if (result.satisfiesTCloseness) {
    insights.push(
      `All ${result.sensitiveAttributes.length} sensitive attributes satisfy threshold (Max distance: ${result.maxDistance.toFixed(3)})`
    );
  } else {
    insights.push(
      `Max distance ${result.maxDistance.toFixed(3)} exceeds threshold ${result.tThreshold}`
    );
  }

  const failingAttributes = Object.entries(result.attributeResults)
    .filter(([, res]) => !res.satisfiesTCloseness)
    .map(([name]) => name);

  if (failingAttributes.length > 0) {
    insights.push(`Attributes failing t-closeness: ${failingAttributes.join(', ')}`);
  }

  return insights;
}