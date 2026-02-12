import type { RiskLevel } from "@/types/privacy-analysis";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

// Grade colors and styles used in privacy analysis results
export const gradeStyles: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500" },
  B: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500" },
  C: { bg: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500" },
  D: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500" },
  F: { bg: "bg-red-500", text: "text-red-500", border: "border-red-500" },
};

// Risk level styles with associated icons
export const riskLevelStyles: Record<RiskLevel, { bg: string; text: string; icon: typeof Shield }> = {
  minimal: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", icon: ShieldCheck },
  low: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", icon: Shield },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", icon: ShieldAlert },
  high: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", icon: ShieldAlert },
  critical: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", icon: ShieldX },
};

// Status colors for metric cards
export const statusColors = {
  pass: { text: "text-green-500", bg: "bg-green-500" },
  warning: { text: "text-yellow-500", bg: "bg-yellow-500" },
  fail: { text: "text-red-500", bg: "bg-red-500" },
};

// Priority styles for recommendations
export const priorityStyles = {
  critical: { border: "border-l-red-500", bg: "bg-red-50 dark:bg-red-900/10" },
  high: { border: "border-l-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10" },
  medium: { border: "border-l-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/10" },
  low: { border: "border-l-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
};

export const priorityBadgeVariants = {
  critical: "sensitive",
  high: "quasi",
  medium: "secondary",
  low: "outline",
} as const;

// Help content for privacy metrics
export const privacyMetricsHelp = {
  kAnonymity: {
    title: "K-Anonymity",
    description: "K-anonymity ensures that each record in a dataset is indistinguishable from at least k-1 other records with respect to quasi-identifiers.",
    keyPoints: [
      "A higher k-value means better privacy protection",
      "Minimum recommended k is usually 5 or higher",
      "All records must belong to equivalence classes of size ≥ k",
      "Protects against identity disclosure through quasi-identifiers",
    ],
    example: "With k=5, any combination of quasi-identifiers (like age, ZIP code, gender) will match at least 5 different people.",
  },
  lDiversity: {
    title: "L-Diversity",
    description: "L-diversity extends k-anonymity by ensuring that each equivalence class has at least l 'well-represented' values for sensitive attributes.",
    keyPoints: [
      "Addresses the homogeneity attack weakness in k-anonymity",
      "Ensures diversity of sensitive values within groups",
      "Higher l means more diverse sensitive attribute values",
      "Protects against attribute disclosure attacks",
    ],
    example: "With l=3, each group of indistinguishable records must have at least 3 different values for sensitive attributes like 'diagnosis'.",
  },
  tCloseness: {
    title: "T-Closeness",
    description: "T-closeness ensures that the distribution of sensitive attributes within any equivalence class is close to their distribution in the overall dataset.",
    keyPoints: [
      "Addresses skewness and similarity attacks on l-diversity",
      "Uses Earth Mover's Distance (EMD) to measure distribution similarity",
      "Lower t-value means stricter privacy (closer to overall distribution)",
      "Typically t ranges from 0 to 1",
    ],
    example: "With t=0.2, the distribution of salaries in any group can differ from the overall salary distribution by at most 20%.",
  },
  reidentificationRisk: {
    title: "Re-identification Risk",
    description: "Measures the probability that an individual can be uniquely identified in the dataset, considering different attacker models.",
    keyPoints: [
      "Prosecutor risk: Attacker knows target is in the dataset",
      "Journalist risk: Attacker doesn't know if target is in dataset",
      "Marketer risk: Attacker wants to match records across datasets",
      "Lower risk percentage means better privacy protection",
    ],
    example: "A 5% re-identification risk means there's a 5% chance an attacker could identify a specific individual.",
  },
  techniqueDetection: {
    title: "Privacy Techniques",
    description: "Detection of privacy-preserving techniques that have been applied to the dataset.",
    keyPoints: [
      "Generalization: Replacing specific values with broader categories",
      "Suppression: Removing or masking certain values",
      "Perturbation: Adding noise to numerical values",
      "Synthetic data: Artificial data that preserves statistical properties",
    ],
    example: "Detecting that ages have been generalized to ranges (e.g., 25-30) or that names have been suppressed.",
  },
};
