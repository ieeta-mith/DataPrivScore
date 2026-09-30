import { PieChart } from "lucide-react";

import { LDiversityInlineConfig } from "./ui/config";

import type { PluginConfigSchema, PluginInput, PluginOutput, PluginUIExtension, PrivacyPlugin } from "@/types/privacy-plugins";
import type { LDiversityResult, LDiversityConfig } from "./types";
import { calculateLDiversity, calculateScore, generateInsights, getStatus } from "./calculator";
import { LDiversityDetails, LDiversityHelp } from "./ui/analysis";

export const lDiversityPlugin: PrivacyPlugin<LDiversityResult, LDiversityConfig> = {
  metadata: {
    id: 'l-diversity',
    name: 'L-Diversity',
    description: 'Ensures diversity in sensitive attributes within equivalence classes',
    version: '1.0.0',
    category: 'privacy-model',
    defaultWeight: 0.20,
    required: true,
  },

  getConfigurationSchema(): PluginConfigSchema[] {
    return [
      {
        key: 'lThreshold',
        type: 'number',
        label: 'L-Diversity Threshold (l)',
        description: 'Minimum distinct sensitive values per group',
        min: 2,
        max: 10,
        defaultValue: 2
      }
    ]
  },
  
  getDefaultConfig(): LDiversityConfig {
    return { lThreshold: 2, diversityType: 'distinct', cValue: 1.0 };
  },

  validateConfig(config: LDiversityConfig): true | string {
    if (typeof config.lThreshold !== 'number' || config.lThreshold < 1) {
      return 'lThreshold must be a positive number';
    }

    if (!['distinct', 'entropy', 'recursive'].includes(config.diversityType)) {
      return 'diversityType must be one of: distinct, entropy, recursive';
    }

    if (typeof config.cValue !== 'number' || config.cValue <= 0) {
      return 'cValue must be a positive number';
    }

    return true;
  },

  canCalculate(input: PluginInput): boolean {
    return input.parsedCSV.rows.length > 0;
  },

  calculate(input: PluginInput, config: LDiversityConfig): PluginOutput<LDiversityResult> {
    const result = calculateLDiversity(
      input.parsedCSV,
      input.classification,
      config.lThreshold,
      config.diversityType,
      config.cValue
    )

    const score = calculateScore(result);

    return { 
      result,
      score,
      status: getStatus(score),
      details: `l=${result.lValue} (threshold: ${config.lThreshold}), ${result.complianceRate.toFixed(1)}% compliant`,
      insights: generateInsights(result),
    };
  }
};

export const lDiversityUI: PluginUIExtension<LDiversityResult, LDiversityConfig> = {
  id: 'l-diversity',
  title: 'L-Diversity',
  icon: PieChart,
  
  InlineConfig: LDiversityInlineConfig,
  ConfigTab: undefined,
  
  DetailsComponent: LDiversityDetails,
  HelpComponent: LDiversityHelp,
  formatQuickStat: (data) => `l = ${data?.lValue ?? '?'}`
};