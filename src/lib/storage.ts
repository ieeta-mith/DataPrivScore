import type { ClassificationResult } from "@/types/attribute-classification";
import type { PrivacyIndexResult, PrivacyAnalysisConfig } from "@/types/privacy-analysis";
import type { ParsedCSV } from "@/types/csv-parser";
import { DEFAULT_PRIVACY_CONFIG } from "@/utils/constants";

let storedParsedCSV: ParsedCSV | null = null;
let storedClassificationResult: ClassificationResult | null = null;
let storedFileName: string | null = null;
let storedPrivacyResult: PrivacyIndexResult | null = null;
let storedPrivacyConfig: PrivacyAnalysisConfig = DEFAULT_PRIVACY_CONFIG;

export function setClassificationData(
  parsedCSV: ParsedCSV,
  result: ClassificationResult,
  fileName: string,
) {
  storedParsedCSV = parsedCSV;
  storedClassificationResult = result;
  storedFileName = fileName;
}

export function updateClassificationResult(updatedResult: ClassificationResult) {
  storedClassificationResult = updatedResult;
}

export function getClassificationData() {
  return {
    parsedCSV: storedParsedCSV,
    result: storedClassificationResult,
    fileName: storedFileName,
  };
}

export function clearClassificationData() {
  storedParsedCSV = null;
  storedClassificationResult = null;
  storedFileName = null;
}

export function setPrivacyConfig(config: PrivacyAnalysisConfig) {
  storedPrivacyConfig = config;
}

export function getPrivacyConfig(): PrivacyAnalysisConfig {
  return storedPrivacyConfig;
}

export function resetPrivacyConfig() {
  storedPrivacyConfig = DEFAULT_PRIVACY_CONFIG;
}

export function setPrivacyResultData(
  privacyResult: PrivacyIndexResult,
  classification: ClassificationResult,
  parsedCSV: ParsedCSV,
  fileName: string
) {
  storedPrivacyResult = privacyResult;
  storedClassificationResult = classification;
  storedParsedCSV = parsedCSV;
  storedFileName = fileName;
}

export function getPrivacyResultData() {
  return {
    privacyResult: storedPrivacyResult,
    classification: storedClassificationResult,
    parsedCSV: storedParsedCSV,
    fileName: storedFileName,
  };
}

export function clearPrivacyResultData() {
  storedPrivacyResult = null;
  storedClassificationResult = null;
  storedParsedCSV = null;
  storedFileName = null;
}