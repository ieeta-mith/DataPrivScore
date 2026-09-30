import { 
  calculateKAnonymity, 
  calculateScore, 
  getStatus, 
  generateInsights 
} from './calculator';

import type { 
  PrivacyPlugin, 
  PluginInput, 
  PluginOutput, 
  PluginConfigSchema, 
  PluginUIExtension
} from '@/types/privacy-plugins';
import type { KAnonymityResult, KAnonymityConfig } from './types';
import { Users } from 'lucide-react';
import { KAnonymityDetails, KAnonymityHelp } from './ui/analysis';
import { KAnonymityInlineConfig } from './ui/config';

export const kAnonymityPlugin: PrivacyPlugin<KAnonymityResult, KAnonymityConfig> = {
  metadata: {
    id: 'k-anonymity',
    name: 'K-Anonymity',
    description: 'Ensures each record is indistinguishable from at least k-1 others based on quasi-identifiers',
    version: '1.0.0',
    category: 'privacy-model',
    defaultWeight: 0.25,
    required: true,
  },

  getConfigurationSchema(): PluginConfigSchema[] {
    return [
      {
        key: 'kThreshold',
        type: 'number',
        label: 'K-Anonymity Threshold (k)',
        description: 'Minimum records with same quasi-identifier values',
        min: 2,
        max: 20,
        defaultValue: 5
      }
    ];
  },

  getDefaultConfig(): KAnonymityConfig {
    return { kThreshold: 5 };
  },

  validateConfig(config: KAnonymityConfig): true | string {
    if (typeof config.kThreshold !== 'number' || config.kThreshold < 1) {
      return 'kThreshold must be a positive number';
    }
    return true;
  },

  canCalculate(input: PluginInput): boolean {
    const hasQuasi = input.classification.attributes.some(a => a.type === 'quasi-identifier');
    return input.parsedCSV.rows.length > 0 && hasQuasi;
  },

  calculate(input: PluginInput, config: KAnonymityConfig): PluginOutput<KAnonymityResult> {
    const result = calculateKAnonymity(
      input.parsedCSV,
      input.classification,
      config.kThreshold
    );

    const score = calculateScore(result);

    return {
      result,
      score,
      status: getStatus(score),
      details: `k=${result.kValue} (threshold: ${config.kThreshold}), ${result.complianceRate.toFixed(1)}% compliant`,
      insights: generateInsights(result),
    };
  }
};

export const kAnonymityUI: PluginUIExtension<KAnonymityResult, KAnonymityConfig> = {
  id: 'k-anonymity',
  title: 'K-Anonymity Analysis',
  icon: Users,

  InlineConfig: KAnonymityInlineConfig,
  ConfigTab: undefined,

  DetailsComponent: KAnonymityDetails,
  HelpComponent: KAnonymityHelp,
  formatQuickStat: (data) => `k = ${data.kValue}`
};