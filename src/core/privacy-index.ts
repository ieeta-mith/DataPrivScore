import { getPluginRegistry } from '@/core/plugin-registry';

import type { PluginInput, AggregatedPluginResults } from '@/types/privacy-plugins';
import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';

export interface AnalysisInput {
	parsedCSV: ParsedCSV;
	classification: ClassificationResult;
	pluginConfigs: Record<string, unknown>;
	pluginWeights: Record<string, number>;
	enabledPlugins: Record<string, boolean>;
}

export interface PrivacyIndexResult extends AggregatedPluginResults {
	riskLevel: string;
	timestamp: Date;
	metadata: {
		recordCount: number;
		attributeCount: number;
		classificationSummary: ClassificationResult['summary'];
		analysisDuration: number;
	};
}

function getRiskLevel(score: number): string {
	if (score >= 90) return 'minimal';
	if (score >= 75) return 'low';
	if (score >= 60) return 'medium';
	if (score >= 50) return 'high';
	return 'critical';
}

export function calculatePrivacyIndex(input: AnalysisInput): PrivacyIndexResult {
	const startTime = performance.now();
	const registry = getPluginRegistry();

	// Sync Zustand storage state into the Registry before execution
	for (const pluginId of Object.keys(input.pluginConfigs)) {
		registry.setPluginEnabled(pluginId, input.enabledPlugins[pluginId]);

		if (input.pluginWeights[pluginId] !== undefined) {
			registry.setPluginWeight(pluginId, input.pluginWeights[pluginId]);
		}

		if (input.pluginConfigs[pluginId] !== undefined) {
			registry.setPluginConfig(pluginId, input.pluginConfigs[pluginId]);
		}
	}

	// Build the base input
	const baseInput: Omit<PluginInput, 'getUpstreamResult'> = {
		parsedCSV: input.parsedCSV,
		classification: input.classification,
		globalConfig: {
			includeDetailedAnalysis: true,
		},
	};

	const aggregatedResults = registry.executeAll(baseInput);
	const endTime = performance.now();

	return {
		...aggregatedResults,
		riskLevel: getRiskLevel(aggregatedResults.overallScore),
		timestamp: new Date(),
		metadata: {
			recordCount: input.parsedCSV.rows.length,
			attributeCount: input.parsedCSV.headers.length,
			classificationSummary: input.classification.summary,
			analysisDuration: endTime - startTime,
		},
	};
}
