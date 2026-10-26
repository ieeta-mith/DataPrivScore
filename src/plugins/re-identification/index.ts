import { calculateRisks, getRiskStatus, generateRiskInsights } from './calculator';
import type { 
  PrivacyPlugin, 
  PluginInput, 
  PluginOutput, 
  PluginConfigSchema,
  PluginUIExtension
} from '@/types/privacy-plugins';
import type { ReIdentificationRiskResult, ReIdentificationRiskConfig, ExpectedUpstreamData } from './types';
import { ShieldAlert } from 'lucide-react';
import { RiskDetails, RiskHelp } from './ui/analysis';
import { RiskInlineConfig } from './ui/config';

export const reidentificationRiskPlugin: PrivacyPlugin<ReIdentificationRiskResult, ReIdentificationRiskConfig> = {
  metadata: {
    id: 'reidentification-risk',
    name: 'Re-identification Risk',
    description: 'Calculates the probability of record linkage attacks (Prosecutor, Journalist, and Marketer risks).',
    version: '1.0.0',
    category: 'risk-assessment',
    defaultWeight: 0.30,
    required: true,
    dependencies: ['k-anonymity']
  },

  getConfigurationSchema(): PluginConfigSchema[] {
    return [
      {
        key: 'populationSize',
        type: 'number',
        label: 'Target Population Size (N_pop)',
        description: 'Estimated real-world target population size. Leave empty for conservative worst-case.',
      }
    ];
  },

  getDefaultConfig(): ReIdentificationRiskConfig {
    return { populationSize: 1 }; 
  },

  canCalculate(input: PluginInput): boolean {
    return input.parsedCSV.rows.length > 0;
  },

  calculate(input: PluginInput, config: ReIdentificationRiskConfig): PluginOutput<ReIdentificationRiskResult> {
    const upstreamOutput = input.getUpstreamResult<ExpectedUpstreamData>('k-anonymity');

    const kMin = upstreamOutput?.result?.kValue ?? 1;
    const kAvg = upstreamOutput?.result?.averageClassSize ?? 1;
    const nData = input.parsedCSV.rows.length;

    const result = calculateRisks(kMin, kAvg, nData, config.populationSize);

    return {
      result,
      score: result.score,
      status: getRiskStatus(result.score),
      details: `Max Risk: ${result.maxRisk.toFixed(1)}% | Score: ${result.score.toFixed(1)}`,
      insights: generateRiskInsights(result),
    };
  }
};

export const reidentificationRiskUI: PluginUIExtension<ReIdentificationRiskResult, ReIdentificationRiskConfig> = {
  id: 'reidentification-risk',
  title: 'Re-identification Risk',
  icon: ShieldAlert,
  InlineConfig: RiskInlineConfig,
  DetailsComponent: RiskDetails,
  HelpComponent: RiskHelp,
  formatQuickStat: (data) => `Score: ${data.score.toFixed(0)}`
};