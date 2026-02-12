// Plugin Types
export type {
  PluginId,
  PluginCategory,
  MetricStatus,
  PluginInput,
  PluginOutput,
  PluginMetadata,
  PrivacyPlugin,
  PluginRegistrationOptions,
  RegisteredPlugin,
  PluginExecutionResult,
  AggregatedPluginResults,
  ExtractPluginResult,
  ExtractPluginConfig,
  PluginFactory,
} from '@/types/privacy-plugins';

// Plugin Registry
export {
  getPluginRegistry,
  registerPlugin,
  unregisterPlugin,
  executePlugins,
  resetPluginRegistry,
} from './registry';

// K-Anonymity Plugin
export {
  kAnonymityPlugin,
  calculateKAnonymity,
  calculateKAnonymityScore,
  getKAnonymityViolationDetails,
} from './k-anonymity';
export type { KAnonymityConfig } from './k-anonymity';

// L-Diversity Plugin
export {
  lDiversityPlugin,
  calculateLDiversity,
  calculateLDiversityScore,
  getLDiversityInsights,
} from './l-diversity';
export type { LDiversityConfig } from './l-diversity';

// T-Closeness Plugin
export {
  tClosenessPlugin,
  calculateTCloseness,
  calculateTClosenessScore,
  getTClosenessInsights,
} from './t-closeness';
export type { TClosenessConfig } from './t-closeness';

// Technique Detection Plugin
export {
  techniqueDetectionPlugin,
  detectPrivacyTechniques,
  calculateTechniqueDetectionScore,
} from './technique-detection';
export type { TechniqueDetectionConfig } from './technique-detection';

// ============================================================================
// Plugin Registration Helper
// ============================================================================

import { getPluginRegistry } from './registry';
import { kAnonymityPlugin } from './k-anonymity';
import { lDiversityPlugin } from './l-diversity';
import { tClosenessPlugin } from './t-closeness';
import { techniqueDetectionPlugin } from './technique-detection';

export function registerBuiltInPlugins(): void {
  const registry = getPluginRegistry();
  
  // Register core privacy models
  registry.register(kAnonymityPlugin);
  registry.register(lDiversityPlugin);
  registry.register(tClosenessPlugin);
  registry.register(techniqueDetectionPlugin);
}

export function getBuiltInPlugins() {
  return [
    kAnonymityPlugin,
    lDiversityPlugin,
    tClosenessPlugin,
    techniqueDetectionPlugin,
  ];
}
