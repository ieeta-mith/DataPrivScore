import type { RiskLevel } from "@/types/privacy-plugins";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

export const riskLevelStyles: Record<RiskLevel, { bg: string; text: string; icon: typeof Shield }> = {
  minimal: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", icon: ShieldCheck },
  low: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", icon: Shield },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", icon: ShieldAlert },
  high: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", icon: ShieldAlert },
  critical: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", icon: ShieldX },
};

export const statusColors = {
  pass: { text: "text-green-500", bg: "bg-green-500" },
  warning: { text: "text-yellow-500", bg: "bg-yellow-500" },
  fail: { text: "text-red-500", bg: "bg-red-500" },
};