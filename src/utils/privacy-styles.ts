import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

export const riskLevelStyles: Record<string, { bg: string; text: string; icon: typeof Shield; circleBg?: string }> = {
  minimal: { bg: "bg-emerald-500", circleBg: "bg-emerald-100", text: "text-emerald-700", icon: ShieldCheck },
  low: { bg: "bg-green-500", circleBg: "bg-green-100", text: "text-green-700", icon: Shield },
  medium: { bg: "bg-yellow-500", circleBg: "bg-yellow-100", text: "text-yellow-700", icon: ShieldAlert },
  high: { bg: "bg-orange-500", circleBg: "bg-orange-100", text: "text-orange-700", icon: ShieldAlert },
  critical: { bg: "bg-red-500", circleBg: "bg-red-100", text: "text-red-700", icon: ShieldX },
};

export const statusColors = {
  pass: { text: "text-green-500", bg: "bg-green-500" },
  warning: { text: "text-yellow-500", bg: "bg-yellow-500" },
  fail: { text: "text-red-500", bg: "bg-red-500" },
};