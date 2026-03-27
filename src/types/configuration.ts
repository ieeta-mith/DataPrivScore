import type { METRIC_THRESHOLDS, MetricToggle, TechniqueToggle } from "@/types/privacy-analysis";
import type { LucideIcon } from "lucide-react";

export type MetricKey = keyof MetricToggle;
export type TechniqueKey = keyof TechniqueToggle;

export interface MetricConfig {
  key: MetricKey;
  icon: LucideIcon;
  hasThreshold: boolean;
  thresholdKey?: keyof typeof METRIC_THRESHOLDS;
  color: string;
}