/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { updateAttributeClassification } from '@/services/attribute-classifier';
import { getPluginRegistry } from '@/core/plugin-registry';

import type { ClassificationResult, AttributeType } from '@/types/attribute-classification';
import type { ParsedCSV } from '@/types/csv-parser';
import type { PrivacyIndexResult } from '@/types/privacy-analysis';

const getDefaultPluginState = () => {
  const registry = getPluginRegistry();
  const plugins = registry.getAllPlugins();
  
  const enabledPlugins: Record<string, boolean> = {};
  const pluginConfigs: Record<string, any> = {};
  const pluginWeights: Record<string, number> = {};

  plugins.forEach((rp) => {
    const id = rp.plugin.metadata.id;
    enabledPlugins[id] = rp.options.enabled;
    pluginConfigs[id] = rp.options.config;
    pluginWeights[id] = rp.options.weight;
  });

  return { enabledPlugins, pluginConfigs, pluginWeights };
};

interface PrivacyState {
  // Core Data
  parsedCSV: ParsedCSV | null;
  classificationResult: ClassificationResult | null;
  fileName: string | null;
  privacyResult: PrivacyIndexResult | null;

  // Dynamic Plugin Configuration State
  enabledPlugins: Record<string, boolean>;
  pluginConfigs: Record<string, any>;
  pluginWeights: Record<string, number>;

  // Classification Actions
  setClassificationData: (csv: ParsedCSV, result: ClassificationResult, name: string) => void;
  updateAttribute: (name: string, type: AttributeType) => void;
  clearClassificationData: () => void;
  setPrivacyResultData: (privacyResult: PrivacyIndexResult, classification: ClassificationResult, parsedCSV: ParsedCSV, fileName: string) => void;

  // Dynamic Configuration Actions
  initializeConfiguration: () => void;
  setPluginEnabled: (pluginId: string, enabled: boolean) => void;
  setPluginConfig: (pluginId: string, config: any) => void;
  setPluginWeight: (pluginId: string, weight: number) => void;
  normalizeWeights: () => void;
  resetConfiguration: () => void;
}

export const usePrivacyStore = create<PrivacyState>((set) => ({
  parsedCSV: null,
  classificationResult: null,
  fileName: null,
  privacyResult: null,

  enabledPlugins: {},
  pluginConfigs: {},
  pluginWeights: {},

  setClassificationData: (csv, result, name) => 
    set({ parsedCSV: csv, classificationResult: result, fileName: name }),

  updateAttribute: (name, type) => 
    set((state) => {
      if (!state.classificationResult) return state;
      return { classificationResult: updateAttributeClassification(state.classificationResult, name, type) };
    }),

  setPrivacyResultData: (privacyResult, classification, parsedCSV, fileName) => 
    set({ privacyResult, classificationResult: classification, parsedCSV, fileName }),
  
  clearClassificationData: () => 
    set({ parsedCSV: null, classificationResult: null, fileName: null }),

  initializeConfiguration: () => set((state) => {
    if (Object.keys(state.enabledPlugins).length > 0) return state;
    return getDefaultPluginState();
  }),

  setPluginEnabled: (pluginId, enabled) => 
    set((state) => ({
      enabledPlugins: { ...state.enabledPlugins, [pluginId]: enabled }
    })),

  setPluginConfig: (pluginId, config) => 
    set((state) => ({
      pluginConfigs: { ...state.pluginConfigs, [pluginId]: config }
    })),

  setPluginWeight: (pluginId, weight) =>
    set((state) => ({
      pluginWeights: { ...state.pluginWeights, [pluginId]: weight }
    })),

  normalizeWeights: () =>
    set((state) => {
      const enabledWeights = Object.entries(state.pluginWeights).filter(
        ([key]) => state.enabledPlugins[key]
      );
      
      const totalWeight = enabledWeights.reduce((sum, [, weight]) => sum + weight, 0);

      if (totalWeight === 0) return state;

      const newWeights = { ...state.pluginWeights };
      enabledWeights.forEach(([key]) => {
        newWeights[key] = state.pluginWeights[key] / totalWeight;
      });

      return { pluginWeights: newWeights };
    }),

  resetConfiguration: () => set(() => getDefaultPluginState()),
}));