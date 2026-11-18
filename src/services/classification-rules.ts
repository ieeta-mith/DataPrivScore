import type { ClassificationRule, DataPatternInfo } from '@/types/attribute-classification';

// ============================================================================
// DIRECT IDENTIFIERS
// ============================================================================
export const directIdentifierRules: ClassificationRule[] = [
	{
		namePatterns: [
			/^(patient|person|user|customer|employee|member|client)[\s_-]?id$/i,
			/^id$/i,
			/^(unique|primary)[\s_-]?id$/i,
			/^record[\s_-]?id$/i,
		],
		type: 'direct-identifier',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [
			/^(full[\s_-]?)?name$/i,
			/^(first|last|middle|given|family|sur)[\s_-]?name$/i,
			/^(patient|person|user|customer|employee)[\s_-]?name$/i,
		],
		type: 'direct-identifier',
		dataPattern: 'text',
	},
	{
		namePatterns: [/e[\s_-]?mail/i, /^email[\s_-]?address$/i],
		type: 'direct-identifier',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [
			/^(ssn|social[\s_-]?security)/i,
			/^national[\s_-]?id/i,
			/^passport/i,
			/^driver[\s_-]?license/i,
			/^(tax|fiscal)[\s_-]?id/i,
			/^nif$/i,
			/^(bi|cc|citizen[\s_-]?card)/i,
		],
		type: 'direct-identifier',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [/phone/i, /^(mobile|cell|telephone)/i, /^contact[\s_-]?number/i],
		type: 'direct-identifier',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [/^(ip[\s_-]?)?address$/i, /^street/i, /^home[\s_-]?address/i, /^residence/i],
		type: 'direct-identifier',
		dataPattern: 'text',
	},
	{
		namePatterns: [
			/^bank[\s_-]?account/i,
			/^credit[\s_-]?card/i,
			/^(iban|swift|bic)/i,
			/^account[\s_-]?number/i,
		],
		type: 'direct-identifier',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [/^(license|registration)[\s_-]?plate/i, /^vehicle[\s_-]?id/i, /^vin$/i],
		type: 'direct-identifier',
		dataPattern: 'identifier',
	},
];

// ============================================================================
// QUASI-IDENTIFIERS
// ============================================================================
export const quasiIdentifierRules: ClassificationRule[] = [
	{
		namePatterns: [/^age$/i, /^age[\s_-]?(group|range|bracket)?$/i],
		type: 'quasi-identifier',
		dataPattern: 'numeric',
	},
	{
		namePatterns: [
			/^(birth[\s_-]?)?(date|day|year|month)/i,
			/^dob$/i,
			/^date[\s_-]?of[\s_-]?birth/i,
		],
		type: 'quasi-identifier',
		dataPattern: 'date',
	},
	{
		namePatterns: [/^(gender|sex)$/i],
		type: 'quasi-identifier',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(zip|postal)[\s_-]?(code)?$/i, /^post[\s_-]?code$/i],
		type: 'quasi-identifier',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [
			/^(city|town|county|state|province|country|region|district)/i,
			/^(geo)?[\s_-]?location$/i,
			/location/i,
		],
		type: 'quasi-identifier',
		dataPattern: 'location',
	},
	{
		namePatterns: [/^(race|ethnicity)/i, /^ethnic[\s_-]?group/i],
		type: 'quasi-identifier',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(occupation|job|profession|employment)/i, /^job[\s_-]?title$/i],
		type: 'quasi-identifier',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(marital|marriage)[\s_-]?status/i],
		type: 'quasi-identifier',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^education/i, /^(degree|qualification)/i],
		type: 'quasi-identifier',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^nationality$/i, /^citizenship$/i],
		type: 'quasi-identifier',
		dataPattern: 'categorical',
	},
];

// ============================================================================
// SENSITIVE ATTRIBUTES
// ============================================================================
export const sensitiveAttributeRules: ClassificationRule[] = [
	{
		namePatterns: [
			/^(diagnosis|disease|condition|illness)/i,
			/^medical[\s_-]?(condition|history|record)/i,
			/^health[\s_-]?(status|condition)/i,
			/^icd[\s_-]?(code|10)?/i,
		],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(treatment|medication|drug|prescription)/i, /^therapy/i, /^procedure/i],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [
			/^(salary|income|wage|earning|compensation)/i,
			/^(annual|monthly|hourly)[\s_-]?(salary|income|pay)/i,
		],
		type: 'sensitive',
		dataPattern: 'numeric',
	},
	{
		namePatterns: [/^(religion|religious)/i, /^faith$/i],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(political|party)/i, /^(voting|vote)/i],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(sexual[\s_-]?orientation|lgbtq)/i],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(hiv|aids|std|sti)/i],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [
			/^(mental[\s_-]?health|psychiatric|psychological)/i,
			/^(depression|anxiety|disorder)/i,
		],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(criminal|arrest|conviction|offense)/i],
		type: 'sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(genetic|dna|genome)/i, /^biometric/i],
		type: 'sensitive',
		dataPattern: 'text',
	},
	{
		namePatterns: [
			/^(blood[\s_-]?pressure|bp)$/i,
			/^(cholesterol|glucose|bmi|heart[\s_-]?rate)/i,
			/^(vital[\s_-]?signs?|lab[\s_-]?results?)/i,
		],
		type: 'sensitive',
		dataPattern: 'numeric',
	},
	{
		namePatterns: [/^(test[\s_-]?result|lab[\s_-]?value)/i],
		type: 'sensitive',
		dataPattern: 'text',
	},
	{
		namePatterns: [
			/^(debt|loan|mortgage|bankruptcy)/i,
			/^(credit[\s_-]?score|financial[\s_-]?status)/i,
		],
		type: 'sensitive',
		dataPattern: 'numeric',
	},
];

// ============================================================================
// NON-SENSITIVE ATTRIBUTES
// ============================================================================
export const nonSensitiveRules: ClassificationRule[] = [
	{
		namePatterns: [
			/^(created|updated|modified|timestamp)[\s_-]?(at|date|time)?$/i,
			/^(date|time)[\s_-]?(created|updated|modified)?$/i,
			/^record[\s_-]?date$/i,
		],
		type: 'non-sensitive',
		dataPattern: 'date',
	},
	{
		namePatterns: [/^(hash|checksum|digest)/i, /[\s_-]hash$/i],
		type: 'non-sensitive',
		dataPattern: 'hash',
	},
	{
		namePatterns: [/^(status|state|flag)$/i, /^is[\s_-]?/i, /^has[\s_-]?/i],
		type: 'non-sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(category|type|class|group)$/i, /[\s_-](category|type|class)$/i],
		type: 'non-sensitive',
		dataPattern: 'categorical',
	},
	{
		namePatterns: [/^(count|total|quantity|number[\s_-]?of)/i],
		type: 'non-sensitive',
		dataPattern: 'numeric',
	},
	{
		namePatterns: [/^(description|notes?|comments?|remarks?)$/i],
		type: 'non-sensitive',
		dataPattern: 'text',
	},
	{
		namePatterns: [/^(version|revision)$/i],
		type: 'non-sensitive',
		dataPattern: 'identifier',
	},
	{
		namePatterns: [/^anonymized/i, /^masked/i, /^pseudonym/i],
		type: 'non-sensitive',
		dataPattern: 'text',
	},
];

export const allClassificationRules: ClassificationRule[] = [
	...directIdentifierRules,
	...sensitiveAttributeRules,
	...quasiIdentifierRules,
	...nonSensitiveRules,
];

export const dataPatterns: DataPatternInfo[] = [
	{
		type: 'identifier',
		pattern: [
			/^[A-Z]{1,3}\d{3,}[A-Z]?$/i,
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		],
	},
	{
		type: 'ip_address',
		pattern: [
			/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, // IPv4
			/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, // IPv6
		],
	},
	{
		type: 'phone',
		pattern: [/^\+?[1-9]\d{1,14}$/, /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/],
	},
	{
		type: 'bool',
		pattern: [/^(true|false)$/i, /^(yes|no)$/i, /^(0|1)$/i, /^(y|n)$/i],
	},
	{
		type: 'numeric',
		pattern: [/^-?\d+\.?\d*$/],
	},
	{
		type: 'date',
		pattern: [
			/^\d{4}-\d{2}-\d{2}$/,
			/^\d{2}\/\d{2}\/\d{4}$/,
			/^\d{2}-\d{2}-\d{4}$/,
			/^\d{4}\/\d{2}\/\d{2}$/,
			/^\d{2}:\d{2}(:\d{2})?$/,
		],
	},
	{
		type: 'hash',
		pattern: [
			/^[a-fA-F0-9]{32}$/, // MD5
			/^[a-fA-F0-9]{40}$/, // SHA-1
			/^[a-fA-F0-9]{64}$/, // SHA-256
		],
	},
];
