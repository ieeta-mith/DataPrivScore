import type { LucideIcon } from 'lucide-react';

export type AttributeType = 
  | 'direct-identifier'
  | 'quasi-identifier'
  | 'sensitive'
  | 'non-sensitive';

export interface AttributeClassification {
  name: string;
  type: AttributeType;
  confidence: string;
  sampleValues: string[];
  dataPattern: DataPattern;
}

export type DataPattern = 
  | 'numeric'
  | 'categorical'
  | 'date'
  | 'identifier'
  | 'text'
  | 'boolean'
  | 'hash'
  | 'location'
  | 'unknown'
  | 'ip_address'
  | 'phone';

export interface ClassificationResult {
  attributes: AttributeClassification[];
  summary: ClassificationSummary;
  timestamp: Date;
}

export interface ClassificationSummary {
  totalAttributes: number;
  directIdentifiers: number;
  quasiIdentifiers: number;
  sensitiveAttributes: number;
  nonSensitiveAttributes: number;
}

export interface ClassificationRule {
  namePatterns: RegExp[];
  type: AttributeType;
  dataPattern?: DataPattern;
}

export interface AttributeTypeInfo {
  title: string;
  label: AttributeType;
  icon: LucideIcon;
  short: string;
  examples: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface DataPatternInfo {
  type: string;
  pattern: RegExp[];
}
 
export interface ClassificationView {
  result: ClassificationResult;
  onUpdateAttribute: (name: string, type: AttributeType) => void;
  editMode: boolean;
  handleWarningDialog: (
    attribute: AttributeClassification,
    targetType: AttributeType
  ) => void;
}

