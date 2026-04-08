import { METRIC_THRESHOLDS, METRIC_INFO } from "@/types/privacy-analysis";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThresholdWarning(
  metricKey: keyof typeof METRIC_THRESHOLDS,
  value: number
): { type: 'low' | 'high' | null; message: string } {
  const thresholdConfig = METRIC_THRESHOLDS[metricKey];
  const metricInfo = METRIC_INFO[metricKey];

  if (value < thresholdConfig.recommended.min) {
    return { type: 'low', message: metricInfo.warningLow };
  }
  if (value > thresholdConfig.recommended.max) {
    return { type: 'high', message: metricInfo.warningHigh };
  }
  return { type: null, message: '' };
}