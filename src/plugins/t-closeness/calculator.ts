import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { MetricStatus } from '@/types/privacy-plugins';
import type { TClosenessResult, TClosenessClassResult, EquivalenceClassWithSensitiveValues } from './types';

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
			classResults: [],
			violatingClasses: [],
			complianceRate: 100,
			globalDistribution: {},
			sensitiveAttribute: '',
			averageDistance: 0,
		};
  };

	const sensitiveAttr = sensitiveAttributes[0];
	const sensitiveIndex = parsedCSV.headers.indexOf(sensitiveAttr.name);

	if (sensitiveIndex === -1) {
		return {
			maxDistance: 0,
			satisfiesTCloseness: true,
			tThreshold,
			classResults: [],
			violatingClasses: [],
			complianceRate: 100,
			globalDistribution: {},
			sensitiveAttribute: sensitiveAttr.name,
			averageDistance: 0,
		};
	}

	const quasiIndices = quasiIdentifiers.map(name => 
		parsedCSV.headers.indexOf(name)
	).filter(index => index !== -1);

	const globalDistribution = calculateGlobalDistribution(parsedCSV, sensitiveIndex);
	const isNumerical = sensitiveAttr.dataPattern === 'numeric';

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

function calculateLocalDistribution(values: string[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  const total = values.length;

  for (const value of values) {
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
	if (!result.sensitiveAttribute) return 50;

	const cr = result.complianceRate / 100;

	const dMax = result.maxDistance;
	const tThreshold = result.tThreshold;
	const dAvg = result.averageDistance;

	const mMax = 1 - (Math.max(0, dMax - tThreshold) / (1 - tThreshold));
	const score = 100 * cr * 0.5 * (mMax + (1 - dAvg));
	
	return Math.max(0, Math.min(100, score));
}

export function getStatus(score: number): MetricStatus {
	if (score >= 70) return 'pass';
	if (score >= 40) return 'warning';
	return 'fail';
}

export function generateInsights(result: TClosenessResult): string[] {
	const insights: string[] = [];

	if (!result.sensitiveAttribute) {
		insights.push('No sensitive attribute classified - t-closeness not applicable');
		return insights;
	}

	if (result.satisfiesTCloseness) {
		insights.push(
			`Max distribution distance: ${result.maxDistance.toFixed(3)} (threshold: ${result.tThreshold})`
		);
	} else {
		insights.push(
			`Max distance ${result.maxDistance.toFixed(3)} exceeds threshold ${result.tThreshold}`
		);
	}

	// Check for high-distance classes
	const highDistanceClasses = result.classResults.filter(
		c => c.distance > result.tThreshold
	);
	if (highDistanceClasses.length > 0) {
		insights.push(
			`${highDistanceClasses.length} class(es) have skewed distributions`
		);
	}
	return insights;
}
