import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type PluginId = string;

export type PluginCategory = 
  | 'privacy-model'
  | 'technique'
  | 'risk'
  | 'custom';   

export type MetricStatus = 'pass' | 'warning' | 'fail';

export interface GlobalAnalysisConfig {
  includeDetailedAnalysis: boolean;
}

export interface PluginInput {
  parsedCSV: ParsedCSV;
  classification: ClassificationResult;
  globalConfig: GlobalAnalysisConfig;

  getUpstreamResult: <T>(pluginId: PluginId) => PluginOutput<T> | undefined;
}

export interface PluginOutput<TResult = unknown> {
  result: TResult;
  score: number;
  status: MetricStatus;
  details: string;
  insights?: string[];
}

export interface PluginMetadata {
  id: PluginId;
  name: string;
  description: string;
  version: string;
  category: PluginCategory;
  defaultWeight: number;
  required: boolean;
  dependencies?: PluginId[];
}

export type ConfigSchemaType = 'number' | 'boolean' | 'string' | 'select';

export interface PluginConfigSchema {
  key: string;
  type: ConfigSchemaType;
  label: string;
  description: string;
  min?: number;
  max?: number;
  options?: { label: string; value: string | number }[];
  defaultValue?: unknown;
}

export interface PrivacyPlugin<TResult = unknown, TConfig = unknown> {
  readonly metadata: PluginMetadata;

  getConfigurationSchema?(): PluginConfigSchema[];

  calculate(input: PluginInput, pluginConfig: TConfig): PluginOutput<TResult>;
  canCalculate(input: PluginInput): boolean;
  getDefaultConfig(): TConfig;
  validateConfig?(config: TConfig): true | string; 
}
export interface PluginRegistrationOptions<TConfig = unknown> {
  weight?: number;
  enabled?: boolean;
  config?: TConfig;
}

export interface RegisteredPlugin<TResult = unknown, TConfig = unknown> {
  plugin: PrivacyPlugin<TResult>;
  options: Required<PluginRegistrationOptions<TConfig>>;
}
export interface PluginExecutionResult {
  pluginId: PluginId;
  pluginName: string;
  output: PluginOutput;
  weight: number;
  weightedScore: number;
  executionTime: number;
}

export interface AggregatedPluginResults {
  results: PluginExecutionResult[];
  overallScore: number;
  totalExecutionTime: number;
  pluginsExecuted: number;
  skippedPlugins: Array<{
    pluginId: PluginId;
    reason: string;
  }>;
}

// ====================================================
// UI Plugin definitions
// ====================================================

export interface PluginDetailsProps<TData =unknown> {
  data: TData;
}

export interface PluginHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PluginConfigProps<TConfig = unknown> {
  config: TConfig;
  onChange: (newConfig: TConfig) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PluginUIExtension<TData = any, TConfig = any> {
  id: string;
  title: string;
  icon: LucideIcon;

  // Config Components
  InlineConfig?: ComponentType<PluginConfigProps<TConfig>>;
  ConfigTab?: {
    label: string;
    getBadgeCount?: (config: TConfig) => number | null;
    Component: ComponentType<PluginConfigProps<TConfig>>;
  }

  // Privacy Analysis Components
  DetailsComponent: ComponentType<PluginDetailsProps<TData>>;
  HelpComponent: ComponentType<PluginHelpProps>;
  formatQuickStat: (data: TData) => string;
}