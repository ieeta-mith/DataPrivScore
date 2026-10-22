import { Search } from 'lucide-react';

import { TechniqueDetectionConfigTab, TechniqueDetectionInlineConfig } from './ui/config';
import { HelpDialogTechniques, TechniqueDetails } from './ui/analysis';

import { detectPrivacyTechniques, getStatus } from './calculator';

import type { PluginConfigSchema, PluginInput, PluginOutput, PluginUIExtension, PrivacyPlugin } from '@/types/privacy-plugins';
import type { TechniqueDetectionResult, TechniqueDetectionConfig, TechniqueKey } from './types';

const DEFAULT_TECHNIQUE_TOGGLE: Record<TechniqueKey, boolean> = {
	generalization: false, suppression: false, masking: false, hashing: false,
	noiseAddition: false, bucketing: false, pseudonymization: false
}

export const techniqueDetectionPlugin: PrivacyPlugin<TechniqueDetectionResult, TechniqueDetectionConfig> = {
	metadata: {
		id: 'data-anonymization',
		name: 'Data Anonymization Technique Detection',
		description: 'Detects anonymization techniques applied to the dataset',
		version: '2.0.0',
		category: 'heuristic',
		defaultWeight: 0.30,
		required: false,
	},

	getConfigurationSchema(): PluginConfigSchema[] {
		return [
			{
        key: 'generateRecommendations',
        type: 'boolean',
        label: 'Generate Recommendations',
        description: 'Suggest additional privacy techniques for unprotected attributes',
        defaultValue: true
      }
		]
	},

	getDefaultConfig(): TechniqueDetectionConfig {
		return { 
      minConfidence: 0.3,
      generateRecommendations: true,
      enabledTechniques: DEFAULT_TECHNIQUE_TOGGLE
    };
	},

	validateConfig(config: TechniqueDetectionConfig): true | string {
		if (!config.enabledTechniques || typeof config.enabledTechniques !== 'object') {
			return 'enabledTechniques object is required to track technique declarations';
		}
		return true;
	},

	canCalculate(input: PluginInput): boolean {
		return input.parsedCSV.rows.length > 0 && input.classification.attributes.length > 0;
	},

	calculate(input: PluginInput, config: TechniqueDetectionConfig): PluginOutput<TechniqueDetectionResult> {
    const result = detectPrivacyTechniques(
      input.parsedCSV,
      input.classification,
      config
    );

    const score = result.techniqueScore;
    
    // Generate actionable insights for the main dashboard
    const insights: string[] = [];

    if (result.detectedTechniques.length > 0) {
      insights.push(`Verified ${result.detectedTechniques.length} techniques covering ${(result.techniqueCoverage * 100).toFixed(0)}% of attributes`);
    }

    if (result.unverifiedTechniques.length > 0) {
      insights.push(`Unverified declarations: ${result.unverifiedTechniques.join(', ')}`);
    }

    result.recommendations.forEach(rec => {
      insights.push(`[${rec.priority.toUpperCase()}] ${rec.reason} Target: ${rec.targetAttributes.join(', ')}`);
    });

    return {
      result,
      score,
      status: getStatus(score),
      details: `${result.detectedTechniques.length} verified techniques, ${(result.techniqueCoverage * 100).toFixed(1)}% coverage`,
      insights,
    };
  }
	
}

export const techniqueDetectionUI: PluginUIExtension<
	TechniqueDetectionResult,
	TechniqueDetectionConfig
> = {
	id: 'data-anonymization',
	title: 'Anonymization Technique Detection',
	icon: Search,

	InlineConfig: TechniqueDetectionInlineConfig,
	ConfigTab: {
		label: 'Technique Detection',
		getBadgeCount: (config) => {
      if (!config?.enabledTechniques) return 0;
      return Object.values(config.enabledTechniques).filter(Boolean).length;
    },
		Component: TechniqueDetectionConfigTab,
	},

	DetailsComponent: TechniqueDetails,
	HelpComponent: HelpDialogTechniques,
	formatQuickStat: (data) => `${data?.detectedTechniques?.length ?? 0} detected`
};
