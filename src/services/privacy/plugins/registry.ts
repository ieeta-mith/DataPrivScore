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
} from '@/types/privacy-plugins';

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

  register<TResult>(
    plugin: PrivacyPlugin<TResult>,
    options: PluginRegistrationOptions = {}
  ): void {
    const { metadata } = plugin;
    
    // Check for duplicate registration
    if (this.plugins.has(metadata.id)) {
      console.warn(`Plugin "${metadata.id}" is already registered. Overwriting...`);
    }

    // Merge options with defaults
    const registeredPlugin: RegisteredPlugin<TResult> = {
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

  getPluginsByCategory(category: PluginCategory): RegisteredPlugin[] {
    return this.getAllPlugins().filter(
      (rp) => rp.plugin.metadata.category === category
    );
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
      const validation = registered.plugin.validateConfig(config);
      if (validation === true) {
        registered.options.config = config;
        return true;
      }
      console.error(`Invalid config for plugin "${pluginId}": ${validation}`);
    }
    return false;
  }

  executeAll(input: PluginInput): AggregatedPluginResults {
    const results: PluginExecutionResult[] = [];
    const skippedPlugins: Array<{ pluginId: PluginId; reason: string }> = [];
    const startTime = performance.now();

    // Normalize weights to sum to 1
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

      if (!registered.plugin.canCalculate(input)) {
        skippedPlugins.push({ 
          pluginId, 
          reason: 'Cannot calculate with provided input' 
        });
        continue;
      }

      const execStartTime = performance.now();
      
      try {
        const output = registered.plugin.calculate(
          input,
          registered.options.config
        );

        // Normalize weight
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

  executeOne(
    pluginId: PluginId,
    input: PluginInput
  ): PluginOutput | null {
    const registered = this.plugins.get(pluginId);
    if (!registered) {
      console.error(`Plugin "${pluginId}" not found`);
      return null;
    }

    if (!registered.plugin.canCalculate(input)) {
      console.warn(`Plugin "${pluginId}" cannot calculate with provided input`);
      return null;
    }

    return registered.plugin.calculate(input, registered.options.config);
  }

  getWeightConfiguration(): Record<PluginId, number> {
    const config: Record<PluginId, number> = {};
    for (const [id, registered] of this.plugins) {
      config[id] = registered.options.weight;
    }
    return config;
  }

  setWeightConfiguration(config: Record<PluginId, number>): void {
    for (const [id, weight] of Object.entries(config)) {
      this.setPluginWeight(id, weight);
    }
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

  getStats(): {
    totalPlugins: number;
    enabledPlugins: number;
    categories: Record<PluginCategory, number>;
  } {
    const categories: Record<PluginCategory, number> = {
      'privacy-model': 0,
      'technique': 0,
      'risk': 0,
      'custom': 0,
    };

    let enabledCount = 0;

    for (const registered of this.plugins.values()) {
      const category = registered.plugin.metadata.category;
      categories[category] = (categories[category] || 0) + 1;
      if (registered.options.enabled) {
        enabledCount++;
      }
    }

    return {
      totalPlugins: this.plugins.size,
      enabledPlugins: enabledCount,
      categories,
    };
  }
}

export function getPluginRegistry(): PluginRegistry {
  return PluginRegistry.getInstance();
}

export function registerPlugin<TResult>(
  plugin: PrivacyPlugin<TResult>,
  options?: PluginRegistrationOptions
): void {
  getPluginRegistry().register(plugin, options);
}

export function unregisterPlugin(pluginId: PluginId): boolean {
  return getPluginRegistry().unregister(pluginId);
}

export function executePlugins(input: PluginInput): AggregatedPluginResults {
  return getPluginRegistry().executeAll(input);
}

export function resetPluginRegistry(): void {
  PluginRegistry.resetInstance();
}
