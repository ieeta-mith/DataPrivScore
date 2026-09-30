import type {
  PrivacyPlugin,
  PluginId,
  PluginInput,
  PluginOutput,
  PluginRegistrationOptions,
  RegisteredPlugin,
  PluginExecutionResult,
  AggregatedPluginResults,
  PluginCategory,
  PluginConfigSchema,
} from '@/types/privacy-plugins'; // Note: Update this import path to your core types file

export interface PluginUIConfig {
  pluginId: PluginId;
  pluginName: string;
  category: PluginCategory;
  schemas: PluginConfigSchema[];
  currentConfig: unknown;
}

class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<PluginId, RegisteredPlugin> = new Map();
  private executionOrder: PluginId[] = [];

  private constructor() {}

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  static resetInstance(): void {
    PluginRegistry.instance = new PluginRegistry();
  }

  register<TResult, TConfig>(
    plugin: PrivacyPlugin<TResult, TConfig>,
    options: PluginRegistrationOptions<TConfig> = {}
  ): void {
    const { metadata } = plugin;
    
    if (this.plugins.has(metadata.id)) {
      console.warn(`Plugin "${metadata.id}" is already registered. Overwriting...`);
    }

    const registeredPlugin: RegisteredPlugin<TResult, TConfig> = {
      plugin,
      options: {
        weight: options.weight ?? metadata.defaultWeight,
        enabled: options.enabled ?? true,
        config: options.config ?? plugin.getDefaultConfig(),
      },
    };

    this.plugins.set(metadata.id, registeredPlugin as RegisteredPlugin);
    this.updateExecutionOrder();
  }

  unregister(pluginId: PluginId): boolean {
    const result = this.plugins.delete(pluginId);
    if (result) {
      this.updateExecutionOrder();
    }
    return result;
  }

  getPlugin(pluginId: PluginId): RegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  setPluginEnabled(pluginId: PluginId, enabled: boolean): boolean {
    const registered = this.plugins.get(pluginId);
    if (registered) {
      registered.options.enabled = enabled;
      return true;
    }
    return false;
  }

  setPluginWeight(pluginId: PluginId, weight: number): boolean {
    const registered = this.plugins.get(pluginId);
    if (registered) {
      registered.options.weight = Math.max(0, Math.min(1, weight));
      return true;
    }
    return false;
  }

  setPluginConfig(pluginId: PluginId, config: unknown): boolean {
    const registered = this.plugins.get(pluginId);
    if (registered) {
			
      const validation = registered.plugin.validateConfig 
        ? registered.plugin.validateConfig(config) 
        : true;

      if (validation === true) {
        registered.options.config = config;
        return true;
      }
      console.error(`Invalid config for plugin "${pluginId}": ${validation}`);
    }
    return false;
  }

  getAllConfigSchemas(): PluginUIConfig[] {
    return Array.from(this.plugins.values())
      .map(rp => ({
        pluginId: rp.plugin.metadata.id,
        pluginName: rp.plugin.metadata.name,
        category: rp.plugin.metadata.category,
        schemas: rp.plugin.getConfigurationSchema ? rp.plugin.getConfigurationSchema() : [],
        currentConfig: rp.options.config
      }));
  }

  executeAll(baseInput: Omit<PluginInput, 'getUpstreamResult'>): AggregatedPluginResults {
    const results: PluginExecutionResult[] = [];
    const skippedPlugins: Array<{ pluginId: PluginId; reason: string }> = [];
    const startTime = performance.now();
    
    const executionResults = new Map<PluginId, PluginOutput>();

    const enabledPlugins = this.executionOrder
      .map(id => this.plugins.get(id)!)
      .filter(rp => rp.options.enabled);
    
    const totalWeight = enabledPlugins.reduce(
      (sum, rp) => sum + rp.options.weight,
      0
    );

    for (const pluginId of this.executionOrder) {
      const registered = this.plugins.get(pluginId);
      if (!registered) continue;

      if (!registered.options.enabled) {
        skippedPlugins.push({ pluginId, reason: 'Plugin disabled' });
        continue;
      }

      const pluginInput: PluginInput = {
        ...baseInput,
        getUpstreamResult: <T>(id: PluginId) => 
          executionResults.get(id) as PluginOutput<T> | undefined
      };

      if (!registered.plugin.canCalculate(pluginInput)) {
        skippedPlugins.push({ 
          pluginId, 
          reason: 'Cannot calculate with provided input' 
        });
        continue;
      }

      const execStartTime = performance.now();
      
      try {
        const output = registered.plugin.calculate(
          pluginInput,
          registered.options.config
        );

        // Store the result immediately so subsequent plugins can read it
        executionResults.set(pluginId, output);

        const normalizedWeight = totalWeight > 0 
          ? registered.options.weight / totalWeight 
          : 0;

        results.push({
          pluginId,
          pluginName: registered.plugin.metadata.name,
          output,
          weight: normalizedWeight,
          weightedScore: output.score * normalizedWeight,
          executionTime: performance.now() - execStartTime,
        });
      } catch (error) {
        console.error(`Error executing plugin "${pluginId}":`, error);
        skippedPlugins.push({
          pluginId,
          reason: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    const overallScore = Math.round(
      results.reduce((sum, r) => sum + r.weightedScore, 0)
    );

    return {
      results,
      overallScore,
      totalExecutionTime: performance.now() - startTime,
      pluginsExecuted: results.length,
      skippedPlugins,
    };
  }

  private updateExecutionOrder(): void {
    const visited = new Set<PluginId>();
    const order: PluginId[] = [];

    const visit = (pluginId: PluginId) => {
      if (visited.has(pluginId)) return;
      visited.add(pluginId);

      const registered = this.plugins.get(pluginId);
      if (registered?.plugin.metadata.dependencies) {
        for (const depId of registered.plugin.metadata.dependencies) {
          if (this.plugins.has(depId)) {
            visit(depId);
          }
        }
      }

      order.push(pluginId);
    };

    for (const pluginId of this.plugins.keys()) {
      visit(pluginId);
    }

    this.executionOrder = order;
  }
}

export function getPluginRegistry(): PluginRegistry {
  return PluginRegistry.getInstance();
}

export function registerPlugin<TResult, TConfig>(
  plugin: PrivacyPlugin<TResult, TConfig>,
  options?: PluginRegistrationOptions<TConfig>
): void {
  getPluginRegistry().register(plugin, options);
}