/**
 * Privacy Plugin System Types
 * 
 * Defines the interfaces and types for the plugin-based privacy model architecture.
 * Each privacy metric (K-Anonymity, L-Diversity, T-Closeness, etc.) is implemented
 * as a plugin that conforms to these interfaces.
 */

import type { ParsedCSV } from '@/types/csv-parser';
import type { ClassificationResult } from '@/types/attribute-classification';
import type { PrivacyAnalysisConfig } from '@/types/privacy-analysis';

// ============================================================================
// Core Plugin Types
// ============================================================================

/**
 * Unique identifier for a privacy plugin
 */
export type PluginId = 
  | 'k-anonymity'
  | 'l-diversity'
  | 't-closeness'
  | 'technique-detection'
  | 'reidentification-risk'
  | string; // Allow custom plugin IDs

/**
 * Plugin category for grouping and filtering
 */
export type PluginCategory = 
  | 'privacy-model'      // Core privacy models (k-anon, l-div, t-close)
  | 'technique'          // Technique detection
  | 'risk'               // Risk assessment
  | 'custom';            // User-defined plugins

/**
 * Status of a metric calculation
 */
export type MetricStatus = 'pass' | 'warning' | 'fail';

// ============================================================================
// Plugin Input/Output Types
// ============================================================================

/**
 * Standard input for all privacy plugins
 */
export interface PluginInput {
  /** Parsed CSV data */
  parsedCSV: ParsedCSV;
  /** Attribute classification result */
  classification: ClassificationResult;
  /** Analysis configuration */
  config: PrivacyAnalysisConfig;
}

/**
 * Standard output that all plugins must return
 */
export interface PluginOutput<TResult = unknown> {
  /** The raw analysis result (plugin-specific) */
  result: TResult;
  /** Normalized score from 0-100 */
  score: number;
  /** Status indicator */
  status: MetricStatus;
  /** Human-readable details about the result */
  details: string;
  /** Optional insights for the UI */
  insights?: string[];
}

/**
 * Metadata about a plugin
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: PluginId;
  /** Display name for the plugin */
  name: string;
  /** Short description */
  description: string;
  /** Plugin version */
  version: string;
  /** Plugin category */
  category: PluginCategory;
  /** Default weight in overall score calculation */
  defaultWeight: number;
  /** Whether this plugin is required for analysis */
  required: boolean;
  /** Dependencies on other plugins (by ID) */
  dependencies?: PluginId[];
  /** Plugin author (optional) */
  author?: string;
}

// ============================================================================
// Plugin Interface
// ============================================================================

/**
 * Main plugin interface that all privacy metric plugins must implement
 */
export interface PrivacyPlugin<TResult = unknown, TConfig = unknown> {
  /** Plugin metadata */
  readonly metadata: PluginMetadata;
  
  /**
   * Calculate the privacy metric
   * @param input Standard plugin input
   * @param pluginConfig Optional plugin-specific configuration
   * @returns Plugin output with results and score
   */
  calculate(input: PluginInput, pluginConfig?: TConfig): PluginOutput<TResult>;
  
  /**
   * Check if the plugin can run with the given input
   * @param input Standard plugin input
   * @returns true if the plugin can run, false otherwise
   */
  canCalculate(input: PluginInput): boolean;
  
  /**
   * Get the default configuration for this plugin
   * @returns Default plugin-specific configuration
   */
  getDefaultConfig(): TConfig;
  
  /**
   * Validate plugin-specific configuration
   * @param config Configuration to validate
   * @returns true if valid, or an error message
   */
  validateConfig(config: TConfig): true | string;
}

// ============================================================================
// Plugin Registration Types
// ============================================================================

/**
 * Options for plugin registration
 */
export interface PluginRegistrationOptions {
  /** Override the default weight */
  weight?: number;
  /** Whether the plugin is enabled */
  enabled?: boolean;
  /** Plugin-specific configuration */
  config?: unknown;
}

/**
 * Registered plugin with its options
 */
export interface RegisteredPlugin<TResult = unknown> {
  /** The plugin instance */
  plugin: PrivacyPlugin<TResult>;
  /** Registration options */
  options: Required<PluginRegistrationOptions>;
}

// ============================================================================
// Plugin Result Types
// ============================================================================

/**
 * Result from running all plugins
 */
export interface PluginExecutionResult {
  /** Plugin ID */
  pluginId: PluginId;
  /** Plugin name */
  pluginName: string;
  /** Plugin output */
  output: PluginOutput;
  /** Weight used in calculation */
  weight: number;
  /** Weighted score contribution */
  weightedScore: number;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Aggregated results from all plugins
 */
export interface AggregatedPluginResults {
  /** Individual plugin results */
  results: PluginExecutionResult[];
  /** Overall score (0-100) */
  overallScore: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Number of plugins executed */
  pluginsExecuted: number;
  /** Plugins that were skipped */
  skippedPlugins: Array<{
    pluginId: PluginId;
    reason: string;
  }>;
}

// ============================================================================
// Helper Types for Plugin Development
// ============================================================================

/**
 * Helper type to extract the result type from a plugin
 */
export type ExtractPluginResult<P> = P extends PrivacyPlugin<infer R> ? R : never;

/**
 * Helper type to extract the config type from a plugin
 */
export type ExtractPluginConfig<P> = P extends PrivacyPlugin<unknown, infer C> ? C : never;

/**
 * Factory function type for creating plugins
 */
export type PluginFactory<TResult = unknown, TConfig = unknown> = () => PrivacyPlugin<TResult, TConfig>;
