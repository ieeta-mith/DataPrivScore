import type { ClassificationRule } from '@/types/attribute-classification';

/**
 * Classification rules for automatic attribute type detection.
 * Rules are evaluated in order of specificity - more specific rules first.
 * 
 * These rules are based on common privacy frameworks like GDPR, HIPAA, and
 * academic literature on data anonymization (e.g., k-anonymity, l-diversity).
 */

// ============================================================================
// DIRECT IDENTIFIERS
// Attributes that can uniquely identify an individual on their own
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
    confidence: 0.95,
    reason: 'Unique identifier field that directly identifies individuals',
    dataPattern: 'identifier',
  },
  {
    namePatterns: [
      /^(full[\s_-]?)?name$/i,
      /^(first|last|middle|given|family|sur)[\s_-]?name$/i,
      /^(patient|person|user|customer|employee)[\s_-]?name$/i,
    ],
    type: 'direct-identifier',
    confidence: 0.95,
    reason: 'Personal name that directly identifies individuals',
    dataPattern: 'text',
  },
  {
    namePatterns: [
      /e[\s_-]?mail/i,
      /^email[\s_-]?address$/i,
    ],
    type: 'direct-identifier',
    confidence: 0.95,
    reason: 'Email address is a direct identifier',
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
    confidence: 0.98,
    reason: 'Government-issued identification number',
    dataPattern: 'identifier',
  },
  {
    namePatterns: [
      /phone/i,
      /^(mobile|cell|telephone)/i,
      /^contact[\s_-]?number/i,
    ],
    type: 'direct-identifier',
    confidence: 0.90,
    reason: 'Phone number can directly identify individuals',
    dataPattern: 'identifier',
  },
  {
    namePatterns: [
      /^(ip[\s_-]?)?address$/i,
      /^street/i,
      /^home[\s_-]?address/i,
      /^residence/i,
    ],
    type: 'direct-identifier',
    confidence: 0.85,
    reason: 'Physical or network address can identify individuals',
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
    confidence: 0.95,
    reason: 'Financial account identifier',
    dataPattern: 'identifier',
  },
  {
    namePatterns: [
      /^(license|registration)[\s_-]?plate/i,
      /^vehicle[\s_-]?id/i,
      /^vin$/i,
    ],
    type: 'direct-identifier',
    confidence: 0.90,
    reason: 'Vehicle identification can be linked to individuals',
    dataPattern: 'identifier',
  },
];

// ============================================================================
// QUASI-IDENTIFIERS
// Attributes that can be combined to re-identify individuals
// ============================================================================
export const quasiIdentifierRules: ClassificationRule[] = [
  {
    namePatterns: [
      /^age$/i,
      /^age[\s_-]?(group|range|bracket)?$/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.90,
    reason: 'Age is a common quasi-identifier used in linkage attacks',
    dataPattern: 'numeric',
  },
  {
    namePatterns: [
      /^(birth[\s_-]?)?(date|day|year|month)/i,
      /^dob$/i,
      /^date[\s_-]?of[\s_-]?birth/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.92,
    reason: 'Birth date is a powerful quasi-identifier',
    dataPattern: 'date',
  },
  {
    namePatterns: [
      /^(gender|sex)$/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.85,
    reason: 'Gender combined with other attributes can re-identify',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(zip|postal)[\s_-]?(code)?$/i,
      /^post[\s_-]?code$/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.90,
    reason: 'Geographic codes are key quasi-identifiers',
    dataPattern: 'identifier',
  },
  {
    namePatterns: [
      /^(city|town|county|state|province|country|region|district)/i,
      /^(geo)?[\s_-]?location$/i,
      /location/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.85,
    reason: 'Geographic location is a quasi-identifier',
    dataPattern: 'location',
  },
  {
    namePatterns: [
      /^(race|ethnicity)/i,
      /^ethnic[\s_-]?group/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.88,
    reason: 'Ethnicity/race is a quasi-identifier',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(occupation|job|profession|employment)/i,
      /^job[\s_-]?title$/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.80,
    reason: 'Occupation combined with other data can re-identify',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(marital|marriage)[\s_-]?status/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.75,
    reason: 'Marital status is a quasi-identifier',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^education/i,
      /^(degree|qualification)/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.75,
    reason: 'Education level is a quasi-identifier',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^nationality$/i,
      /^citizenship$/i,
    ],
    type: 'quasi-identifier',
    confidence: 0.80,
    reason: 'Nationality is a quasi-identifier',
    dataPattern: 'categorical',
  },
];

// ============================================================================
// SENSITIVE ATTRIBUTES
// Private information that requires protection
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
    confidence: 0.95,
    reason: 'Medical diagnosis is sensitive health information',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(treatment|medication|drug|prescription)/i,
      /^therapy/i,
      /^procedure/i,
    ],
    type: 'sensitive',
    confidence: 0.92,
    reason: 'Treatment information is sensitive medical data',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(salary|income|wage|earning|compensation)/i,
      /^(annual|monthly|hourly)[\s_-]?(salary|income|pay)/i,
    ],
    type: 'sensitive',
    confidence: 0.90,
    reason: 'Financial compensation is sensitive information',
    dataPattern: 'numeric',
  },
  {
    namePatterns: [
      /^(religion|religious)/i,
      /^faith$/i,
    ],
    type: 'sensitive',
    confidence: 0.95,
    reason: 'Religious affiliation is sensitive personal data',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(political|party)/i,
      /^(voting|vote)/i,
    ],
    type: 'sensitive',
    confidence: 0.95,
    reason: 'Political affiliation is sensitive information',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(sexual[\s_-]?orientation|lgbtq)/i,
    ],
    type: 'sensitive',
    confidence: 0.98,
    reason: 'Sexual orientation is highly sensitive',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(hiv|aids|std|sti)/i,
    ],
    type: 'sensitive',
    confidence: 0.98,
    reason: 'Communicable disease status is highly sensitive',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(mental[\s_-]?health|psychiatric|psychological)/i,
      /^(depression|anxiety|disorder)/i,
    ],
    type: 'sensitive',
    confidence: 0.95,
    reason: 'Mental health information is sensitive',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(criminal|arrest|conviction|offense)/i,
    ],
    type: 'sensitive',
    confidence: 0.95,
    reason: 'Criminal history is sensitive information',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(genetic|dna|genome)/i,
      /^biometric/i,
    ],
    type: 'sensitive',
    confidence: 0.98,
    reason: 'Genetic/biometric data is highly sensitive',
    dataPattern: 'text',
  },
  {
    namePatterns: [
      /^(blood[\s_-]?pressure|bp)$/i,
      /^(cholesterol|glucose|bmi|heart[\s_-]?rate)/i,
      /^(vital[\s_-]?signs?|lab[\s_-]?results?)/i,
    ],
    type: 'sensitive',
    confidence: 0.85,
    reason: 'Health measurements are sensitive medical data',
    dataPattern: 'numeric',
  },
  {
    namePatterns: [
      /^(test[\s_-]?result|lab[\s_-]?value)/i,
    ],
    type: 'sensitive',
    confidence: 0.85,
    reason: 'Medical test results are sensitive',
    dataPattern: 'text',
  },
  {
    namePatterns: [
      /^(debt|loan|mortgage|bankruptcy)/i,
      /^(credit[\s_-]?score|financial[\s_-]?status)/i,
    ],
    type: 'sensitive',
    confidence: 0.85,
    reason: 'Financial status information is sensitive',
    dataPattern: 'numeric',
  },
];

// ============================================================================
// NON-SENSITIVE ATTRIBUTES
// Data that is generally not identifying or sensitive
// ============================================================================
export const nonSensitiveRules: ClassificationRule[] = [
  {
    namePatterns: [
      /^(created|updated|modified|timestamp)[\s_-]?(at|date|time)?$/i,
      /^(date|time)[\s_-]?(created|updated|modified)?$/i,
      /^record[\s_-]?date$/i,
    ],
    type: 'non-sensitive',
    confidence: 0.85,
    reason: 'Administrative timestamp, generally non-identifying',
    dataPattern: 'date',
  },
  {
    namePatterns: [
      /^(hash|checksum|digest)/i,
      /[\s_-]hash$/i,
    ],
    type: 'non-sensitive',
    confidence: 0.80,
    reason: 'Data hash/checksum for integrity verification',
    dataPattern: 'hash',
  },
  {
    namePatterns: [
      /^(status|state|flag)$/i,
      /^is[\s_-]?/i,
      /^has[\s_-]?/i,
    ],
    type: 'non-sensitive',
    confidence: 0.70,
    reason: 'Generic status or boolean flag',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(category|type|class|group)$/i,
      /[\s_-](category|type|class)$/i,
    ],
    type: 'non-sensitive',
    confidence: 0.65,
    reason: 'Generic categorization field',
    dataPattern: 'categorical',
  },
  {
    namePatterns: [
      /^(count|total|quantity|number[\s_-]?of)/i,
    ],
    type: 'non-sensitive',
    confidence: 0.70,
    reason: 'Aggregate count or quantity',
    dataPattern: 'numeric',
  },
  {
    namePatterns: [
      /^(description|notes?|comments?|remarks?)$/i,
    ],
    type: 'non-sensitive',
    confidence: 0.60,
    reason: 'Free-text description field',
    dataPattern: 'text',
  },
  {
    namePatterns: [
      /^(version|revision)$/i,
    ],
    type: 'non-sensitive',
    confidence: 0.85,
    reason: 'Version or revision number',
    dataPattern: 'identifier',
  },
  {
    namePatterns: [
      /^anonymized/i,
      /^masked/i,
      /^pseudonym/i,
    ],
    type: 'non-sensitive',
    confidence: 0.75,
    reason: 'Explicitly anonymized or masked field',
    dataPattern: 'text',
  },
];

/**
 * All classification rules combined, ordered by priority.
 * Direct identifiers are checked first (highest priority),
 * followed by sensitive, quasi-identifiers, then non-sensitive.
 */
export const allClassificationRules: ClassificationRule[] = [
  ...directIdentifierRules,
  ...sensitiveAttributeRules,
  ...quasiIdentifierRules,
  ...nonSensitiveRules,
];

/**
 * Get human-readable label for attribute type
 */
export const attributeTypeLabels: Record<string, string> = {
  'direct-identifier': 'Direct Identifier',
  'quasi-identifier': 'Quasi-Identifier',
  'sensitive': 'Sensitive Attribute',
  'non-sensitive': 'Non-Sensitive',
};

/**
 * Get color class for attribute type (Tailwind classes)
 */
export const attributeTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  'direct-identifier': {
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-800',
  },
  'quasi-identifier': {
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
  },
  'sensitive': {
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
  },
  'non-sensitive': {
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-800',
  },
};
