import { create } from 'zustand';
import { DEFAULT_PRIVACY_CONFIG } from '@/types/privacy-analysis';
import { updateAttributeClassification } from '@/services/attribute-classifier';

import type { ClassificationResult } from '@/types/attribute-classification';
import type { PrivacyIndexResult, PrivacyAnalysisConfig } from '@/types/privacy-analysis';
import type { AttributeType } from '@/types/attribute-classification';
import type { ParsedCSV } from '@/types/csv-parser';

interface PrivacyState {
  parsedCSV: ParsedCSV | null;
  classificationResult: ClassificationResult | null;
  fileName: string | null;
  privacyResult: PrivacyIndexResult | null;
  privacyConfig: PrivacyAnalysisConfig;

  setClassificationData: (csv: ParsedCSV, result: ClassificationResult, name: string) => void;
  updateAttribute: (name: string, type: AttributeType) => void;
  clearClassificationData: () => void;
  setPrivacyConfig: (config: PrivacyAnalysisConfig) => void;
  setPrivacyResultData: (privacyResult: PrivacyIndexResult, classification: ClassificationResult, parsedCSV: ParsedCSV, fileName: string) => void;
  resetPrivacyConfig: () => void;
}

export const usePrivacyStore = create<PrivacyState>((set) => ({
  parsedCSV: null,
  classificationResult: null,
  fileName: null,
  privacyResult: null,
  privacyConfig: DEFAULT_PRIVACY_CONFIG,

  setClassificationData: (csv, result, name) => set({ parsedCSV: csv, classificationResult: result, fileName: name }),

  updateAttribute: (name, type) => 
    set((state) => {
      if (!state.classificationResult) return state;
      return { classificationResult: updateAttributeClassification(state.classificationResult, name, type) };
    }),

  setPrivacyResultData: (privacyResult, classification, parsedCSV, fileName) => 
    set({ privacyResult, classificationResult: classification, parsedCSV, fileName }),
  
  clearClassificationData: () => set({ parsedCSV: null, classificationResult: null, fileName: null }),

  setPrivacyConfig: (config) => set({ privacyConfig: config }),

  resetPrivacyConfig: () => set({ privacyConfig: DEFAULT_PRIVACY_CONFIG }),
}));
