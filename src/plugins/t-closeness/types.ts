export interface TClosenessConfig {
  tThreshold: number;
}

export interface AttributeTClosenessResult {
  maxDistance: number;
  averageDistance: number;
  satisfiesTCloseness: boolean;
  complianceRate: number;
  globalDistribution: Record<string, number>;
  violatingClasses: string[];
}

export interface TClosenessResult {
  maxDistance: number;
  satisfiesTCloseness: boolean;
  tThreshold: number;
  complianceRate: number;
  averageDistance: number;
  sensitiveAttributes: string[];
  attributeResults: Record<string, AttributeTClosenessResult>;
  violatingClasses: string[];
}