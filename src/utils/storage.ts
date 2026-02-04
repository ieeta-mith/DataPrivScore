import type { ClassificationResult } from "@/types/attribute-classification";
import type { ParsedCSV } from "@/types/csv-parser";

let storedParsedCSV: ParsedCSV | null = null;
let storedClassificationResult: ClassificationResult | null = null;
let storedFileName: string | null = null;

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