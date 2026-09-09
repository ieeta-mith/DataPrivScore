import type { ParsedCSV } from '@/types/csv-parser';
import type {
	AttributeClassification,
	AttributeType,
	ClassificationResult,
	ClassificationSummary,
	DataPattern,
} from '@/types/attribute-classification';
import { allClassificationRules, dataPatterns } from './classification-rules';

export class AttributeClassifier {
	constructor() {}

	classifyDataset(parsedCSV: ParsedCSV): ClassificationResult {
		const attributes = parsedCSV.headers.map((header, index) => {
			const columnValues = parsedCSV.rows.map((row) => row[index] || '');
			return this.classifyAttribute(header, columnValues);
		});

		const summary = this.generateSummary(attributes);

		return {
			attributes,
			summary,
			timestamp: new Date(),
		};
	}

	classifyAttribute(name: string, values: string[]): AttributeClassification {
		const sampleValues = this.getSampleValues(values);
		const dataPattern = this.detectDataPattern(values);

		// Try rule-based classification first
		const ruleMatch = this.matchRules(name);

		if (ruleMatch) {
			return {
				name,
				type: ruleMatch.type,
				confidence: ruleMatch.confidence,
				sampleValues,
				dataPattern: ruleMatch.dataPattern || dataPattern,
			};
		}

		// Fallback to heuristic classification if no rule matches
		const heuristicResult = this.applyHeuristics(name, sampleValues, dataPattern);

		return {
			name,
			type: heuristicResult.type,
			confidence: heuristicResult.confidence,
			sampleValues,
			dataPattern,
		};
	}

	private matchRules(name: string): {
		type: AttributeType;
		confidence: string;
		dataPattern?: DataPattern;
	} | null {
		for (const rule of allClassificationRules) {
			const nameMatch = rule.namePatterns.some((pattern) => pattern.test(name));

			if (nameMatch) {
				return {
					type: rule.type,
					confidence: 'high',
					dataPattern: rule.dataPattern,
				};
			}
		}

		return null;
	}

	private applyHeuristics(
		name: string,
		values: string[],
		dataPattern: DataPattern
	): { type: AttributeType; confidence: string } {
		const uniqueRatio = this.getUniqueRatio(values);

		// Check for ID-like patterns in name
		if ((/id$/i.test(name) || /^id/i.test(name)) && uniqueRatio > 0.9) 
			return { type: 'direct-identifier',	confidence: 'medium'	};

		if (/code$/i.test(name)) 
			return { type: 'quasi-identifier', confidence: 'medium'	};

		switch (dataPattern) {
			case 'identifier':
			case 'ip_address':
			case 'phone':
				return { type: 'direct-identifier', confidence: 'medium' };

			case 'hash':
				return { type: 'direct-identifier', confidence: 'medium' };

			case 'date':
				if (/created|updated|modified|record/i.test(name)) 
					return { type: 'non-sensitive', confidence: 'medium' };
				return { type: 'quasi-identifier', confidence: 'medium' };

			case 'numeric':
				if (uniqueRatio > 0.9) return { type: 'direct-identifier', confidence: 'low' };
				if (uniqueRatio < 0.2) return { type: 'quasi-identifier', confidence: 'medium' };
        return { type: 'non-sensitive', confidence: 'medium' };

      case 'boolean':
			case 'categorical':
				if (uniqueRatio < 0.1) return {	type: 'quasi-identifier',	confidence: 'medium'	};
				return { type: 'non-sensitive', confidence: 'medium'	};

			default:
				if (uniqueRatio < 0.2)	return { type: 'quasi-identifier', confidence: 'low'	};
				return { type: 'non-sensitive',	confidence: 'low' };
		}
	}

	private detectDataPattern(values: string[]): DataPattern {
		const nonEmptyValues = values.filter((v) => v.trim() !== '');
		if (nonEmptyValues.length === 0) return 'unknown';

		const sampleSize = Math.min(50, nonEmptyValues.length);
		const sample = nonEmptyValues.slice(0, sampleSize);

		const MATCH_TRESHOLD = 0.85;

		for (const patternInfo of dataPatterns) {
			const matchCount = sample.filter((value) =>
				patternInfo.pattern.some((regex) => regex.test(value))
			).length;
			if (matchCount / sampleSize >= MATCH_TRESHOLD) {
				return patternInfo.type as DataPattern;
			}
		}

		const uniqueRatio = this.getUniqueRatio(nonEmptyValues);

		if (uniqueRatio > 0.8) return 'text';
		if (uniqueRatio < 0.3) return 'categorical';

		return 'text';
	}

	private getSampleValues(values: string[]): string[] {
		return [...new Set(values.filter((v) => v.trim() !== ''))];
	}

	private getUniqueRatio(values: string[]): number {
		const nonEmpty = values.filter((v) => v.trim() !== '');
		if (nonEmpty.length === 0) return 0;

		const unique = new Set(nonEmpty);
		return unique.size / nonEmpty.length;
	}

	private generateSummary(attributes: AttributeClassification[]): ClassificationSummary {
		const totalAttributes = attributes.length;
		const directIdentifiers = attributes.filter((a) => a.type === 'direct-identifier').length;
		const quasiIdentifiers = attributes.filter((a) => a.type === 'quasi-identifier').length;
		const sensitiveAttributes = attributes.filter((a) => a.type === 'sensitive').length;
		const nonSensitiveAttributes = attributes.filter((a) => a.type === 'non-sensitive').length;

		return {
			totalAttributes,
			directIdentifiers,
			quasiIdentifiers,
			sensitiveAttributes,
			nonSensitiveAttributes,
		};
	}
}

export const attributeClassifier = new AttributeClassifier();

export function classifyDataset(parsedCSV: ParsedCSV): ClassificationResult {
	const classifier = new AttributeClassifier();
	return classifier.classifyDataset(parsedCSV);
}

const getSummaryKey = (
	type: AttributeType
): keyof Omit<ClassificationSummary, 'totalAttributes'> => {
	switch (type) {
		case 'direct-identifier':
			return 'directIdentifiers';
		case 'quasi-identifier':
			return 'quasiIdentifiers';
		case 'sensitive':
			return 'sensitiveAttributes';
		case 'non-sensitive':
			return 'nonSensitiveAttributes';
	}
};

export function updateAttributeClassification(
	result: ClassificationResult,
	attributeName: string,
	newType: AttributeType
): ClassificationResult {
	const targetIndex = result.attributes.findIndex((attr) => attr.name === attributeName);

	if (targetIndex === -1) return result;

	const targetAttr = result.attributes[targetIndex];
	if (targetAttr.type === newType) return result;

	const updatedAttributes = [...result.attributes];
	updatedAttributes[targetIndex] = {
		...targetAttr,
		type: newType,
		confidence: 'manual',
	};

	const oldKey = getSummaryKey(targetAttr.type);
	const newKey = getSummaryKey(newType);

	const updatedSummary: ClassificationSummary = {
		...result.summary,
		[oldKey]: result.summary[oldKey] - 1,
		[newKey]: result.summary[newKey] + 1,
	};

	return {
		...result,
		attributes: updatedAttributes,
		summary: updatedSummary,
	};
}
