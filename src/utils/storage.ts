import type { ClassificationResult } from "@/types/attribute-classification";
import type { PrivacyIndexResult } from "@/types/privacy-analysis";
import type { ParsedCSV } from "@/types/csv-parser";

let storedParsedCSV: ParsedCSV | null = null;
let storedClassificationResult: ClassificationResult | null = null;
let storedFileName: string | null = null;
let storedPrivacyResult: PrivacyIndexResult | null = null;

export function setClassificationData(
  parsedCSV: ParsedCSV,
  result: ClassificationResult,
  fileName: string,
) {
  storedParsedCSV = parsedCSV;
  storedClassificationResult = result;
  storedFileName = fileName;
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