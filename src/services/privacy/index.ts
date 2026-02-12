

// ============================================================================
// Plugin-Based Architecture
// ============================================================================

export {
  // Registry
  getPluginRegistry,
  registerPlugin,
  unregisterPlugin,
  executePlugins,
  resetPluginRegistry,
  registerBuiltInPlugins,
  getBuiltInPlugins,
  // Individual plugins
  kAnonymityPlugin,
  lDiversityPlugin,
  tClosenessPlugin,
  techniqueDetectionPlugin,
} from './plugins';

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
  KAnonymityConfig,
  LDiversityConfig,
  TClosenessConfig,
  TechniqueDetectionConfig,
} from './plugins';

// ============================================================================
// Main Privacy Index Calculator
// ============================================================================

// New plugin-based calculation (recommended)
export { calculatePrivacyIndexWithPlugins } from './privacy-index';

// Legacy direct calculation (maintained for backward compatibility)
export { calculatePrivacyIndex } from './privacy-index';

// ============================================================================
// Individual Metric Calculators (Direct Access)
// ============================================================================

// K-Anonymity
export {
  calculateKAnonymity,
  calculateKAnonymityScore,
  getKAnonymityViolationDetails,
} from './plugins/k-anonymity';

// L-Diversity
export {
  calculateLDiversity,
  calculateLDiversityScore,
  getLDiversityInsights,
} from './plugins/l-diversity';

// T-Closeness
export {
  calculateTCloseness,
  calculateTClosenessScore,
  getTClosenessInsights,
} from './plugins/t-closeness';

// Technique Detection
export {
  detectPrivacyTechniques,
  calculateTechniqueDetectionScore,
} from './plugins/technique-detection';
