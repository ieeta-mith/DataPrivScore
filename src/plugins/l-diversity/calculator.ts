import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { MetricStatus } from '@/types/privacy-plugins';
import type { LDiversityResult, EquivalenceClassWithSensitive, LDiversityType, LDiversityClassResult } from './types';

function buildEquivalenceClassesWithSensitiveAttributes(
	parsedCSV: ParsedCSV,
	quasiIndices: number[],
	sensitiveIndices: number[]
): EquivalenceClassWithSensitive[] {
	const classMap = new Map<string, EquivalenceClassWithSensitive>();

	parsedCSV.rows.forEach((row) => {
		const keyParts = quasiIndices.map((idx) => normalizeValue(row[idx] || ''));
		const key = keyParts.join('|||');

		const sensitiveValue = sensitiveIndices.map((idx) => normalizeValue(row[idx] || '')).join('|');

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

function normalizeValue(value: string): string {
	return value.trim().toLowerCase();
}

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

function checkRecursiveLDiversity(
	distribution: Record<string, number>,
	l: number,
	c: number
): boolean {
	const frequencies = Object.values(distribution).sort((a, b) => b - a);

	if (frequencies.length < l)  return false;

	const mostFrequent = frequencies[0];
	const tailSum = frequencies.slice(l - 1).reduce((sum, freq) => sum + freq, 0)

	return mostFrequent < c * tailSum;
}

function calculateClassLDiversity(
	ec: EquivalenceClassWithSensitive,
	lThreshold: number,
	diversityType: LDiversityType,
	cValue: number
): LDiversityClassResult {
	const distribution: Record<string, number> = {};
	for (const val of ec.sensitiveValues) distribution[val] = (distribution[val] || 0) + 1;

	const distinctCount = Object.keys(distribution).length;
	const entropy = calculateEntropy(distribution, ec.size);

	let satisfiesLDiversity: boolean;

	switch (diversityType) {
		case 'distinct':
			satisfiesLDiversity = distinctCount >= lThreshold;
			break;
		case 'entropy':
			satisfiesLDiversity = entropy >= Math.log2(lThreshold);
			break;
		case 'recursive':
			satisfiesLDiversity = checkRecursiveLDiversity(distribution, lThreshold, cValue);
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
	}
}

export function calculateLDiversity(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult,
	lThreshold: number,
	diversityType: LDiversityType,
	cValue: number
): LDiversityResult {
	const quasiIdentifiers = classification.attributes
		.filter(attr => attr.type === 'quasi-identifier')
		.map(attr => attr.name);

	const sensitiveAttributes = classification.attributes
		.filter(attr => attr.type === 'sensitive')
		.map(attr => attr.name);

	if (sensitiveAttributes.length === 0) {
		return {
			lValue: 0,
			satisfiesLDiversity: true,
			lThreshold,
			diversityType,
			classResults: [],
			violatingClasses: [],
			complianceRate: 100,
			sensitiveAttributes,
			averageEntropy: 0,
		};
	}

	const quasiIndices = quasiIdentifiers.map(name =>
		parsedCSV.headers.indexOf(name)
	).filter(index => index !== -1);

	const sensitiveIndices = sensitiveAttributes.map(name =>
		parsedCSV.headers.indexOf(name)
	).filter(index => index !== -1);

	const equivalenceClasses = buildEquivalenceClassesWithSensitiveAttributes(parsedCSV, quasiIndices, sensitiveIndices);

	const classResults: LDiversityClassResult[] = [];
	const violatingClasses: string[] = [];
	let minL = Infinity;
	let totalEntropy = 0;
	let compliantRecords = 0;
	const totalRecords = parsedCSV.rows.length;

	for (const ec of equivalenceClasses) {
		const result = calculateClassLDiversity(ec, lThreshold, diversityType, cValue);
		classResults.push(result);

		const classL = result.distinctCount;
		if (classL < minL) minL = classL;

		totalEntropy += result.entropy;

		if (!result.satisfiesLDiversity) {
			violatingClasses.push(result.equivalenceClassId);
		} else {
			compliantRecords += ec.size;
		}
	}

	const complianceRate = totalRecords > 0 ? (compliantRecords / totalRecords) * 100 : 0;
	const averageEntropy = equivalenceClasses.length > 0 ? totalEntropy / equivalenceClasses.length : 0;

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

export function calculateScore(result: LDiversityResult): number {
	if (result.sensitiveAttributes.length === 0) return 50

	// Distinctness term
	const lMin = Math.max(1, result.lValue);
	const lThreshold = Math.max(2, result.lThreshold);
	const cr = result.complianceRate / 100;
	const distinctnessTerm = Math.min(1, Math.log(lMin) / Math.log(lThreshold));

	// Entropy term
	const H_avg = result.averageEntropy;
  const H_target = Math.log2(2 * lThreshold); 
  const entropyTerm = Math.min(1, H_avg / H_target);

	// Final score
	const score = 100 * cr * 0.5 * (distinctnessTerm + entropyTerm);
	return Math.round(Math.max(0, Math.min(100, score)));
}

export function getStatus(score: number): MetricStatus {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warning';
  return 'fail';
}

export function generateInsights(result: LDiversityResult): string[] {
	const insights: string[] = [];

	if (result.sensitiveAttributes.length === 0) {
		insights.push('No sensitive attributes classified - l-diversity not applicable');
		return insights;
	}

	if (result.satisfiesLDiversity) {
		insights.push(
			`Dataset achieves ${result.lValue}-diversity (threshold: ${result.lThreshold})`
		);
	} else {
		insights.push(
			`l=${result.lValue} is below the threshold of ${result.lThreshold}`
		);
	}

	// Check for homogeneous classes (l=1)
	const homogeneousClasses = result.classResults.filter(c => c.distinctCount === 1);
	if (homogeneousClasses.length > 0) {
		insights.push(
			`${homogeneousClasses.length} class(es) have homogeneous sensitive values (high risk)`
		);
	}

	// Check for low entropy classes
	const lowEntropyClasses = result.classResults.filter(
		c => c.entropy < 1 && c.distinctCount > 1
	);
	if (lowEntropyClasses.length > 0) {
		insights.push(
			`${lowEntropyClasses.length} class(es) have skewed sensitive value distributions`
		);
	}

	return insights;
}