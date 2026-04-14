import type { MetricToggle, TechniqueToggle } from "@/types/privacy-analysis";
import type { LucideIcon } from "lucide-react";
import { METRIC_THRESHOLDS } from "@/utils/constants";

export type MetricKey = keyof MetricToggle;
export type TechniqueKey = keyof TechniqueToggle;

export interface MetricConfig {
  key: MetricKey;
  icon: LucideIcon;
  hasThreshold: boolean;
  thresholdKey?: keyof typeof METRIC_THRESHOLDS;
  color: string;
}