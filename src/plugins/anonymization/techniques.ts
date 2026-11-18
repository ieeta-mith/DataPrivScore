import type { ClassificationResult } from '@/types/attribute-classification';
import type { ParsedCSV } from '@/types/csv-parser';
import type { DetectedTechnique, TechniqueEvidence } from './types';

export function detectGeneralization(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];

	for (const attr of classification.attributes) {
		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => row[colIndex] || '');
		const uniqueValues = [...new Set(values)];

		const rangePattern = /^\d+[-–]\d+$/;
		const rangeMatches = uniqueValues.filter((v) => rangePattern.test(v.trim()));
		const rangeRatio = rangeMatches.length / values.length;

		if (rangeRatio > 0.1) {
			evidence.push({
				attribute: attr.name,
				confidence: rangeRatio,
				evidenceSamples: [...new Set(rangeMatches)].slice(0, 3),
				reason: `${(rangeRatio * 100).toFixed(1)}% of values formatted as numerical ranges`,
			});
		}

		if (attr.type === 'quasi-identifier') {
			const uniqueCount = new Set(values).size;
			const uniquenessRatio = uniqueCount / values.length;

			if (uniquenessRatio < 0.05 && uniqueCount > 1) {
				const cardinalityConfidence = Math.min(0.9, 1 - uniquenessRatio);
				evidence.push({
					attribute: attr.name,
					confidence: cardinalityConfidence,
					evidenceSamples: [...new Set(values)].slice(0, 3),
					reason: `Extreme cardinality reduction detected (Uniqueness ratio: ${(uniquenessRatio * 100).toFixed(2)}%)`,
				});
			}
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'generalization',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description:
				'Values replaced with broader categories, ranges, or systematically reduced cardinality.',
		});
	}

	return techniques;
}

export function detectMasking(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];

	const maskingPatterns = [
		/\*{2,}/,
		/X{2,}/i,
		/^\d{3}-\*{2}-\d{4}$/,
		/^\*{4}-\*{4}-\*{4}-\d{4}$/,
		/^[\w.]+@\*+\.\w+$/,
		/^\+?\d{1,3}-?\*+-\d{2,4}$/,
	];

	for (const attr of classification.attributes) {
		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => (row[colIndex] || '').trim()).filter(Boolean);
		if (values.length === 0) continue;

		const maskedValues = values.filter((v) => maskingPatterns.some((pattern) => pattern.test(v)));
		const matchRatio = maskedValues.length / values.length;

		if (matchRatio > 0.05) {
			evidence.push({
				attribute: attr.name,
				confidence: matchRatio,
				evidenceSamples: [...new Set(maskedValues)].slice(0, 3),
				reason: `${(matchRatio * 100).toFixed(1)}% of values match common masking patterns`,
			});
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'masking',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description: 'Values partially obscured while preserving original formats.',
		});
	}

	return techniques;
}

export function detectHashing(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];

	const hashPatterns = [
		{ pattern: /^[a-f0-9]{8}$/i, name: 'Short hash (8 chars)' },
		{ pattern: /^[a-f0-9]{16}$/i, name: 'MD5 prefix (16 chars)' },
		{ pattern: /^[a-f0-9]{32}$/i, name: 'MD5 hash (32 chars)' },
		{ pattern: /^[a-f0-9]{40}$/i, name: 'SHA-1 hash (40 chars)' },
		{ pattern: /^[a-f0-9]{64}$/i, name: 'SHA-256 hash (64 chars)' },
		{ pattern: /^[a-f0-9]{128}$/i, name: 'SHA-512 hash (128 chars)' },
	];

	for (const attr of classification.attributes) {
		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => (row[colIndex] || '').trim()).filter(Boolean);
		if (values.length === 0) continue;

		let bestMatchRatio = 0;
		let bestMatchName = '';
		let matchedSamples: string[] = [];

		for (const { pattern, name } of hashPatterns) {
			const matchingValues = values.filter((v) => pattern.test(v));
			const matchRatio = matchingValues.length / values.length;

			if (matchRatio > bestMatchRatio) {
				bestMatchRatio = matchRatio;
				bestMatchName = name;
				matchedSamples = [...new Set(matchingValues)].slice(0, 3);
			}
		}

		const hashNamePattern = /hash|digest|checksum|sha|md5/i;
		const nameModifier = hashNamePattern.test(attr.name) ? 0.2 : 0;
		const finalConfidence = Math.min(1.0, bestMatchRatio + nameModifier);

		if (bestMatchRatio > 0.1) {
			evidence.push({
				attribute: attr.name,
				confidence: finalConfidence,
				evidenceSamples: matchedSamples,
				reason: `${(bestMatchRatio * 100).toFixed(1)}% of values match ${bestMatchName} format${nameModifier ? ' (corroborated by column name)' : ''}`,
			});
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'hashing',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description: 'Values replaced with cryptographic hash representations.',
		});
	}

	return techniques;
}

export function detectSuppression(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];
	const affectedAttributes = new Set<string>();

	const directIdentifiers = classification.attributes.filter((a) => a.type === 'direct-identifier');

	if (directIdentifiers.length === 0) {
		evidence.push({
			attribute: 'Dataset Structure',
			confidence: 1.0,
			evidenceSamples: ['N/A (Columns omitted)'],
			reason:
				'No direct identifiers detected in the dataset, indicating complete column-level suppression',
		});
		affectedAttributes.add('Direct Identifiers (Removed)');
	}

	const suppressionTypes = [
		{ pattern: /^(REDACTED|SUPPRESSED|\[REMOVED\])$/i, weight: 1.0, type: 'explicit placeholders' },
		{ pattern: /^[-]+$/, weight: 0.8, type: 'symbolic placeholders' },
		{ pattern: /^(N\/?A|NULL)$/i, weight: 0.5, type: 'generic nulls' },
	];

	for (const attr of classification.attributes) {
		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => (row[colIndex] || '').trim());
		if (values.length === 0) continue;

		let weightedScore = 0;
		const suppressedSamples = new Set<string>();

		values.forEach((v) => {
			const match = suppressionTypes.find((t) => t.pattern.test(v));
			if (match) {
				weightedScore += match.weight;
				suppressedSamples.add(v);
			} else if (v === '') {
				weightedScore += 0.2;
			}
		});

		const confidence = weightedScore / values.length;

		if (confidence > 0.1 && suppressedSamples.size > 0) {
			evidence.push({
				attribute: attr.name,
				confidence: Math.min(1.0, confidence),
				evidenceSamples: [...suppressedSamples].slice(0, 3),
				reason: `Suppression patterns detected with a weighted density of ${(confidence * 100).toFixed(1)}%`,
			});
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'suppression',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description: 'Values intentionally removed or replaced with placeholders.',
		});
	}

	return techniques;
}

export function detectPseudonymization(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];
	const pseudonymPatterns = [
		/^[A-Z]{1,3}\d{2,6}[A-Z]{0,2}$/i,
		/^(Patient|User|Customer|Client|Subject|Person)[-_]?\d+$/i,
		/^[A-Z]{2,4}[-_]\d{4,8}$/i,
		/^ID[-_]?[a-f0-9]{4,12}$/i,
	];

	for (const attr of classification.attributes) {
		if (attr.type !== 'direct-identifier' && attr.dataPattern !== 'numeric') continue;

		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => (row[colIndex] || '').trim()).filter(Boolean);
		if (values.length === 0) continue;

		let bestMatchRatio = 0;
		let matchedSamples: string[] = [];

		for (const pattern of pseudonymPatterns) {
			const matchingValues = values.filter((v) => pattern.test(v));
			const matchRatio = matchingValues.length / values.length;

			if (matchRatio > bestMatchRatio) {
				bestMatchRatio = matchRatio;
				matchedSamples = [...new Set(matchingValues)].slice(0, 3);
			}
		}

		if (bestMatchRatio > 0.1) {
			evidence.push({
				attribute: attr.name,
				confidence: bestMatchRatio,
				evidenceSamples: matchedSamples,
				reason: `${(bestMatchRatio * 100).toFixed(1)}% of values match artificial pseudonym formats`,
			});
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'pseudonymization',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description: 'Identifiers systematically replaced with artificial pseudonyms.',
		});
	}

	return techniques;
}

export function detectNoiseAddition(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];

	for (const attr of classification.attributes) {
		if (attr.dataPattern !== 'numeric') continue;

		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => parseFloat(row[colIndex])).filter((v) => !isNaN(v));
		if (values.length < 10) continue;

		const highPrecisionCount = values.filter((v) => {
			const decimalPart = v.toString().split('.')[1] || '';
			return decimalPart.length >= 4;
		}).length;

		const precisionRatio = highPrecisionCount / values.length;

		if (precisionRatio > 0.1) {
			evidence.push({
				attribute: attr.name,
				confidence: precisionRatio,
				evidenceSamples: values.slice(0, 3).map((v) => v.toString()),
				reason: `${(precisionRatio * 100).toFixed(1)}% of values exhibit high decimal precision, suggesting stochastic transformation`,
			});
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'noise-addition',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description: 'Stochastic noise addition detected in numerical distributions.',
		});
	}

	return techniques;
}

export function detectBucketing(
	parsedCSV: ParsedCSV,
	classification: ClassificationResult
): DetectedTechnique[] {
	const techniques: DetectedTechnique[] = [];
	const evidence: TechniqueEvidence[] = [];
	const bucketPatterns = [
		/^(Low|Medium|High|Very\s*High|Very\s*Low)$/i,
		/^(Small|Large|Extra\s*Large|XL|XXL)$/i,
		/^(Young|Middle[-\s]?Aged?|Old|Elderly|Senior)$/i,
		/^(Tier|Level|Grade|Class)[-\s]?[1-5A-E]$/i,
		/^<?\d+[-–]\d+>?$/,
		/^[<>≤≥]=?\s*\d+$/,
	];

	for (const attr of classification.attributes) {
		const colIndex = parsedCSV.headers.indexOf(attr.name);
		if (colIndex === -1) continue;

		const values = parsedCSV.rows.map((row) => (row[colIndex] || '').trim()).filter(Boolean);
		if (values.length === 0) continue;

		const matchingValues = values.filter((v) => bucketPatterns.some((pattern) => pattern.test(v)));
		const matchRatio = matchingValues.length / values.length;

		const uniqueBuckets = new Set(matchingValues).size;
		const isDiscrete = uniqueBuckets >= 2 && uniqueBuckets <= 15;

		if (matchRatio > 0.1 && isDiscrete) {
			evidence.push({
				attribute: attr.name,
				confidence: Math.min(1.0, matchRatio * (isDiscrete ? 1.2 : 1.0)),
				evidenceSamples: [...new Set(matchingValues)].slice(0, 4),
				reason: `${(matchRatio * 100).toFixed(1)}% of values grouped into ${uniqueBuckets} discrete buckets`,
			});
		}
	}

	if (evidence.length > 0) {
		techniques.push({
			technique: 'bucketing',
			affectedAttributes: [...new Set(evidence.map((e) => e.attribute))],
			confidence: Math.max(...evidence.map((e) => e.confidence)),
			evidence,
			description: 'Continuous values grouped into discrete bins.',
		});
	}
	return techniques;
}
