import type { AttributeTypeInfo } from '@/types/attribute-classification';
import type { MetricConfig, TechniqueKey } from '@/types/configuration';
import type { LDiversityType, MetricToggle, PrivacyAnalysisConfig, RiskLevel, TechniqueToggle } from '@/types/privacy-analysis';
import type { Variants } from 'motion/react';
import {
	BarChart3,
	FileSpreadsheet,
	ShieldCheck,
	Lock,
	User,
	Users,
	Shield,
	FileText,
	Layers,
	Activity,
	Search,
	EyeOff,
	Eye,
	Hash,
	UserX,
	Key,
	Waves,
	Shuffle,
	ShieldAlert,
	ShieldX,
} from 'lucide-react';

export const features = [
	{
		icon: FileSpreadsheet,
		title: 'CSV Upload',
		description: 'Upload your dataset in CSV format for analysis',
		color: 'from-purple-500 to-pink-500',
	},
	{
		icon: BarChart3,
		title: 'Attribute Classification',
		description: 'Automatically identify and classify data attributes',
		color: 'from-pink-500 to-rose-500',
	},
	{
		icon: ShieldCheck,
		title: 'Privacy Models',
		description: 'Apply multiple privacy-preserving techniques',
		color: 'from-rose-500 to-orange-500',
	},
	{
		icon: Lock,
		title: 'Privacy Index',
		description: 'Get a quantitative privacy score for your dataset',
		color: 'from-orange-500 to-purple-500',
	},
];

export const HIGH_CONFIDENCE_THRESHOLD = 0.8;

export const attributeTypes: AttributeTypeInfo[] = [
	{
		title: 'Direct Identifier',
		label: 'direct-identifier',
		icon: User,
		short: 'Uniquely identifies an individual on its own',
		examples: 'Name, SSN, Email, Phone, Patient ID',
		color: {
			bg: 'bg-red-100 dark:bg-red-950',
			text: 'text-red-700 dark:text-red-300',
			border: 'border-red-300 dark:border-red-800',
		},
	},
	{
		title: 'Quasi-Identifier',
		label: 'quasi-identifier',
		icon: Users,
		short: 'Can be combined to re-identify individuals',
		examples: 'Age, Gender, ZIP Code, Birth Data, Occupation',
		color: {
			bg: 'bg-amber-100 dark:bg-amber-950',
			text: 'text-amber-700 dark:text-amber-300',
			border: 'border-amber-300 dark:border-amber-800',
		},
	},
	{
		title: 'Sensitive Attribute',
		label: 'sensitive',
		icon: Shield,
		short: 'Contains sensitive personal information',
		examples: 'Health Conditions, Salary, Religion, Health Data',
		color: {
			bg: 'bg-purple-100 dark:bg-purple-950',
			text: 'text-purple-700 dark:text-purple-300',
			border: 'border-purple-300 dark:border-purple-800',
		},
	},
	{
		title: 'Non-Sensitive Attribute',
		label: 'non-sensitive',
		icon: FileText,
		short: 'Non-identifying public data',
		examples: 'Timestamps, Status Flags, Hashes, Categories',
		color: {
			bg: 'bg-green-100 dark:bg-green-950',
			text: 'text-green-700 dark:text-green-300',
			border: 'border-green-300 dark:border-green-800',
		},
	},
];

export const METRIC_CONFIGS: MetricConfig[] = [
	{ key: 'kAnonymity', icon: Users, hasThreshold: true, thresholdKey: 'kAnonymity', color: 'blue' },
	{
		key: 'lDiversity',
		icon: Layers,
		hasThreshold: true,
		thresholdKey: 'lDiversity',
		color: 'purple',
	},
	{
		key: 'tCloseness',
		icon: Activity,
		hasThreshold: true,
		thresholdKey: 'tCloseness',
		color: 'cyan',
	},
	{ key: 'techniqueDetection', icon: Search, hasThreshold: false, color: 'amber' },
	{ key: 'reidentificationRisk', icon: Shield, hasThreshold: false, color: 'red' },
];

export const TECHNIQUE_ICONS: Record<TechniqueKey, typeof Layers> = {
	generalization: Layers,
	suppression: EyeOff,
	masking: Eye,
	hashing: Hash,
	pseudonymization: UserX,
	tokenization: Key,
	noiseAddition: Waves,
	dataSwapping: Shuffle,
};

export const L_DIVERSITY_TYPES: { value: LDiversityType; label: string; description: string }[] = [
	{ value: 'distinct', label: 'Distinct', description: 'Count of unique sensitive values' },
	{ value: 'entropy', label: 'Entropy', description: 'Information-theoretic diversity measure' },
	{ value: 'recursive', label: 'Recursive', description: 'Most restrictive, frequency-based' },
];

export const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
			delayChildren: 0.1,
		},
	},
};

export const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: 'easeInOut',
		},
	},
};

export const tabVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const METRIC_THRESHOLDS = {
  kAnonymity: {
    min: 2,
    max: 20,
    default: 5,
    recommended: { min: 3, max: 10 },
    label: 'K-Anonymity Threshold (k)',
    description: 'Minimum records with same quasi-identifier values',
    unit: 'records',
  },
  lDiversity: {
    min: 2,
    max: 10,
    default: 2,
    recommended: { min: 2, max: 5 },
    label: 'L-Diversity Threshold (l)',
    description: 'Minimum distinct sensitive values per group',
    unit: 'values',
  },
  tCloseness: {
    min: 0.01,
    max: 0.5,
    default: 0.3,
    recommended: { min: 0.15, max: 0.35 },
    label: 'T-Closeness Threshold (t)',
    description: 'Maximum distance between local and global distribution',
    unit: '',
  },
} as const;

export const METRIC_INFO = {
  kAnonymity: {
    name: 'K-Anonymity',
    shortDescription: 'Ensures each record is indistinguishable from at least k-1 other records',
    guidance: 'Higher k values provide stronger privacy but may reduce data utility. A value of 5 is commonly recommended.',
    warningLow: 'Values below 3 may not provide adequate privacy protection against re-identification attacks.',
    warningHigh: 'Values above 10 may significantly reduce data utility without proportional privacy gains.',
  },
  lDiversity: {
    name: 'L-Diversity',
    shortDescription: 'Ensures each equivalence class has at least l distinct sensitive values',
    guidance: 'Protects against attribute disclosure attacks. Higher values increase diversity requirements.',
    warningLow: 'Values below 2 offer minimal protection against attribute disclosure.',
    warningHigh: 'Values above 5 may be hard to achieve with limited sensitive value diversity.',
  },
  tCloseness: {
    name: 'T-Closeness',
    shortDescription: 'Limits the distribution difference between groups and overall dataset',
    guidance: 'Lower t values enforce stricter distribution similarity. Values between 0.15-0.35 are typical.',
    warningLow: 'Values below 0.15 may be too restrictive and hard to satisfy.',
    warningHigh: 'Values above 0.35 may allow significant distribution skew.',
  },
  techniqueDetection: {
    name: 'Technique Detection',
    shortDescription: 'Detects applied privacy-preserving techniques like masking, generalization, etc.',
    guidance: 'This metric analyzes data patterns to identify privacy techniques already applied.',
    warningLow: '',
    warningHigh: '',
  },
  reidentificationRisk: {
    name: 'Re-identification Risk',
    shortDescription: 'Estimates the probability of identifying individuals in the dataset',
    guidance: 'Combines multiple factors to assess overall re-identification vulnerability.',
    warningLow: '',
    warningHigh: '',
  },
} as const;

export const DEFAULT_METRIC_TOGGLE: MetricToggle = {
  kAnonymity: true,
  lDiversity: true,
  tCloseness: true,
  techniqueDetection: true,
  reidentificationRisk: true,
};

export const DEFAULT_TECHNIQUE_TOGGLE: TechniqueToggle = {
  generalization: true,
  suppression: true,
  masking: true,
  hashing: true,
  pseudonymization: true,
  tokenization: true,
  noiseAddition: true,
  dataSwapping: true,
};

export const TECHNIQUE_INFO = {
  generalization: {
    name: 'Generalization',
    description: 'Replaces specific values with broader categories (e.g., exact age → age range)',
    icon: 'Layers',
  },
  suppression: {
    name: 'Suppression',
    description: 'Removes or replaces sensitive values with placeholders (e.g., "*", "N/A")',
    icon: 'EyeOff',
  },
  masking: {
    name: 'Masking',
    description: 'Partially hides values while preserving some information (e.g., "***-**-1234")',
    icon: 'Mask',
  },
  hashing: {
    name: 'Hashing',
    description: 'Transforms values into fixed-length cryptographic representations',
    icon: 'Hash',
  },
  pseudonymization: {
    name: 'Pseudonymization',
    description: 'Replaces identifiers with artificial pseudonyms or codes',
    icon: 'UserX',
  },
  tokenization: {
    name: 'Tokenization',
    description: 'Substitutes sensitive data with non-sensitive tokens',
    icon: 'Key',
  },
  noiseAddition: {
    name: 'Noise Addition',
    description: 'Adds random noise to numerical values while preserving statistical properties',
    icon: 'Waves',
  },
  dataSwapping: {
    name: 'Data Swapping',
    description: 'Exchanges values between records to break linkage',
    icon: 'Shuffle',
  },
} as const;

export const DEFAULT_PRIVACY_CONFIG: PrivacyAnalysisConfig = {
  kThreshold: 5,
  lThreshold: 2,
  tThreshold: 0.3,
  lDiversityType: 'distinct',
  metricWeights: {
    kAnonymity: 0.20,
    lDiversity: 0.20,
    tCloseness: 0.20,
    techniqueDetection: 0.30,
    reidentificationRisk: 0.10,
  },
  includeDetailedAnalysis: true,
  enabledMetrics: DEFAULT_METRIC_TOGGLE,
  enabledTechniques: DEFAULT_TECHNIQUE_TOGGLE,
};

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
