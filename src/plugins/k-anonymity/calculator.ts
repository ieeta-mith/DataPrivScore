import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { MetricStatus } from '@/types/privacy-plugins';
import type { KAnonymityResult, EquivalenceClass } from './types';

export function calculateKAnonymity(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult,
	kThreshold: number
): KAnonymityResult {
	const quasiIdentifiers = classification.attributes
		.filter(attr => attr.type == 'quasi-identifier')
		.map(attr => attr.name);

		const quasiIndices = quasiIdentifiers.map(name => 
			parsedCSV.headers.indexOf(name)
		).filter(index => index !== -1);

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

		const equivalenceClasses = buildEquivalenceClasses(parsedCSV, quasiIndices, quasiIdentifiers);

		const sizeDistribution: Record<number, number> = {};
		let minSize = Infinity;
		const violatingClasses: EquivalenceClass[] = [];
		let compliantRecords = 0;

		for (const ec of equivalenceClasses) {
			sizeDistribution[ec.size] = (sizeDistribution[ec.size] || 0) + 1;

			if (ec.size < minSize) minSize = ec.size;

			if (ec.size < kThreshold) {
				violatingClasses.push(ec);
			} else {
				compliantRecords += ec.size;
			}
		}

		const totalRecords = parsedCSV.rows.length;
		return {
			kValue: minSize,
			satisfiesKAnonymity: minSize >= kThreshold,
			kThreshold,
			equivalenceClassCount: equivalenceClasses.length,
			sizeDistribution,
			violatingClasses,
			complianceRate: totalRecords > 0 ? (compliantRecords / totalRecords) * 100 : 0,
			averageClassSize: equivalenceClasses.length > 0 ? totalRecords / equivalenceClasses.length : 0,
			quasiIdentifiers,
		}
}

function buildEquivalenceClasses(
	parsedCSV: ParsedCSV,
	quasiIndices: number[],
	quasiIdentifierNames: string[]
): EquivalenceClass[] {
	const classMap = new Map<string, EquivalenceClass>();

	parsedCSV.rows.forEach((row, rowIndex) => {
		const values: Record<string, string> = {};
		const keyParts: string[] = [];

		quasiIndices.forEach((colIndex, i) => {
			const value = (row[colIndex] || '').trim().toLowerCase();
			values[quasiIdentifierNames[i]] = value;
			keyParts.push(value);
		});

		const key = keyParts.join('|||');

		if (classMap.has(key)) {
			const ec = classMap.get(key)!;
			ec.size += 1;
			ec.rowIndices.push(rowIndex);
		} else {
			classMap.set(key, {
				id: `EC-${classMap.size + 1}`,
				quasiIdentifierValues: values,
				size: 1,
				rowIndices: [rowIndex],
			});
		}
	})

	return Array.from(classMap.values());
}

export function calculateScore(result: KAnonymityResult): number {
	const kMin = Math.max(1, result.kThreshold);
	const kThreshold = Math.max(2, result.kThreshold);

	const cr = result.complianceRate / 100;
	const logRatio = Math.log(kMin) / Math.log(kThreshold);
	const rawScore = 100 * cr * Math.min(1, logRatio);

	return Math.round(Math.max(0, Math.min(100, rawScore)));
}

export function getStatus(score: number): MetricStatus {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warning';
  return 'fail';
}

export function generateInsights(result: KAnonymityResult): string[] {
  const insights: string[] = [];
  const uniqueRecords = result.violatingClasses.filter(ec => ec.size === 1).length;
  
  if (uniqueRecords > 0) insights.push(`${uniqueRecords} record(s) are uniquely identifiable and at high risk`);
  if (result.satisfiesKAnonymity) {
    insights.push(`Dataset achieves k=${result.kValue} anonymity (threshold: ${result.kThreshold})`);
  } else {
    insights.push(`k=${result.kValue} is below the threshold of ${result.kThreshold}`);
  }
  if (result.quasiIdentifiers.length > 5) {
    insights.push(`High number of quasi-identifiers (${result.quasiIdentifiers.length}) increases re-identification risk`);
  }

  return insights;
}