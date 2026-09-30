import { Activity } from "lucide-react";
import type { PluginConfigSchema, PluginInput, PluginOutput, PluginUIExtension, PrivacyPlugin } from "@/types/privacy-plugins";
import type { TClosenessResult, TClosenessConfig } from "./types";

import { TClosenessInlineConfig } from "./ui/config";
import { TClosenessDetails, TClosenessHelp } from "./ui/analysis";
import { calculateScore, calculateTCloseness, generateInsights, getStatus } from "./calculator";

export const tClosenessPlugin: PrivacyPlugin<TClosenessResult, TClosenessConfig> = {
	metadata: {
		id: 't-closeness',
		name: 'T-Closeness',
		description: 'Ensures that the distribution of sensitive attributes in each equivalence class is close to the distribution in the overall dataset',
		version: '1.0.0',
		category: 'privacy-model',
		defaultWeight: 0.20,
		required: true,
	},

	getConfigurationSchema(): PluginConfigSchema[] {
		return [
			{
				key: 'tThreshold',
				type: 'number',
				label: 'T-Closeness Threshold (t)',
				description: 'Maximum allowed distance between local and global distributions',
				min: 0.01,
				max: 5,
				defaultValue: 0.2
			}
		]
	},

	getDefaultConfig(): TClosenessConfig {
		return { tThreshold: 0.2 };
	},

	validateConfig(config: TClosenessConfig): true | string {
		if (typeof config.tThreshold !== 'number' || config.tThreshold <= 0 || config.tThreshold > 1) {
			return 'tThreshold must be a number between 0 and 1';
		}
		return true;
	},

	canCalculate(input: PluginInput): boolean {
		return input.parsedCSV.rows.length > 0;
	},

	calculate(input: PluginInput, config: TClosenessConfig): PluginOutput<TClosenessResult> {
		const result = calculateTCloseness(input.parsedCSV, input.classification, config.tThreshold);
		const score = calculateScore(result);

		return {
			result,
			score,
			status: getStatus(score),
			details: `Max Distance: ${result.maxDistance.toFixed(4)}, T-Threshold: ${result.tThreshold}, Average Distance: ${result.averageDistance.toFixed(4)}, Compliance Rate: ${result.complianceRate.toFixed(1)}%`,
			insights: generateInsights(result)
		};
	}
};

export const tClosenessUI: PluginUIExtension<TClosenessResult, TClosenessConfig> = {
	id: 't-closeness',
	title: 'T-Closeness Analysis',
	icon: Activity,

	InlineConfig: TClosenessInlineConfig,
	ConfigTab: undefined,

	DetailsComponent: TClosenessDetails,
	HelpComponent: TClosenessHelp,
	formatQuickStat: (data) => `t = ${data?.maxDistance?.toFixed(3) ?? '?'}`
};