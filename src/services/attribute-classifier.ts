import type { ParsedCSV } from '@/types/csv-parser';
import type {
  AttributeClassification,
  AttributeType,
  ClassificationConfig,
  ClassificationResult,
  ClassificationSummary,
  DataPattern,
} from '@/types/attribute-classification';
import { allClassificationRules } from './classification-rules';

/**
 * Default configuration for the classifier
 */
const DEFAULT_CONFIG: ClassificationConfig = {
  minConfidenceThreshold: 0.5,
  sampleSize: 10,
  strictMode: false,
};

/**
 * Main classification service for dataset attributes.
 * Runs entirely in the browser with no external dependencies.
 */
export class AttributeClassifier {
  private config: ClassificationConfig;

  constructor(config: Partial<ClassificationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Classify all attributes in a parsed CSV dataset
   */
  classifyDataset(parsedCSV: ParsedCSV): ClassificationResult {
    const attributes = parsedCSV.headers.map((header, index) => {
      const columnValues = parsedCSV.rows.map(row => row[index] || '');
      return this.classifyAttribute(header, columnValues);
    });

    const summary = this.generateSummary(attributes);

    return {
      attributes,
      summary,
      timestamp: new Date(),
    };
  }

  /**
   * Classify a single attribute based on its name and sample values
   */
  classifyAttribute(name: string, values: string[]): AttributeClassification {
    const sampleValues = this.getSampleValues(values);
    const dataPattern = this.detectDataPattern(values);
    
    // Try rule-based classification first
    const ruleMatch = this.matchRules(name, sampleValues);
    
    if (ruleMatch) {
      return {
        name,
        type: ruleMatch.type,
        confidence: ruleMatch.confidence,
        isManualOverride: false,
        sampleValues,
        dataPattern: ruleMatch.dataPattern || dataPattern,
        classificationReason: ruleMatch.reason,
      };
    }

    // Fallback: Use heuristics based on data pattern
    const heuristicResult = this.applyHeuristics(name, sampleValues, dataPattern);
    
    return {
      name,
      type: heuristicResult.type,
      confidence: heuristicResult.confidence,
      isManualOverride: false,
      sampleValues,
      dataPattern,
      classificationReason: heuristicResult.reason,
    };
  }

  /**
   * Match attribute against classification rules
   */
  private matchRules(name: string, values: string[]): {
    type: AttributeType;
    confidence: number;
    reason: string;
    dataPattern?: DataPattern;
  } | null {
    for (const rule of allClassificationRules) {
      // Check name patterns
      const nameMatch = rule.namePatterns.some(pattern => pattern.test(name));
      
      if (nameMatch) {
        let confidence = rule.confidence;
        
        // Optionally boost confidence if value patterns also match
        if (rule.valuePatterns && rule.valuePatterns.length > 0) {
          const valueMatchCount = values.filter(value =>
            rule.valuePatterns!.some(pattern => pattern.test(value))
          ).length;
          
          if (valueMatchCount > 0) {
            confidence = Math.min(1, confidence + 0.05);
          }
        }
        
        // Apply strict mode penalty
        if (this.config.strictMode) {
          confidence = Math.max(0, confidence - 0.1);
        }
        
        return {
          type: rule.type,
          confidence,
          reason: rule.reason,
          dataPattern: rule.dataPattern,
        };
      }
    }
    
    return null;
  }

  /**
   * Apply heuristic classification when no rules match
   */
  private applyHeuristics(
    name: string,
    values: string[],
    dataPattern: DataPattern
  ): { type: AttributeType; confidence: number; reason: string } {
    // Check for ID-like patterns in name
    if (/id$/i.test(name) || /^id/i.test(name)) {
      return {
        type: 'direct-identifier',
        confidence: 0.70,
        reason: 'Name contains ID pattern, likely an identifier',
      };
    }

    // Check for code patterns
    if (/code$/i.test(name)) {
      return {
        type: 'quasi-identifier',
        confidence: 0.65,
        reason: 'Name contains code pattern, could be quasi-identifier',
      };
    }

    // Based on data pattern
    switch (dataPattern) {
      case 'identifier':
        return {
          type: 'direct-identifier',
          confidence: 0.60,
          reason: 'Data pattern suggests unique identifier',
        };
      
      case 'hash':
        return {
          type: 'non-sensitive',
          confidence: 0.70,
          reason: 'Data appears to be hashed/anonymized',
        };
      
      case 'date':
        // Dates are often quasi-identifiers unless clearly administrative
        if (/created|updated|modified|record/i.test(name)) {
          return {
            type: 'non-sensitive',
            confidence: 0.65,
            reason: 'Administrative date field',
          };
        }
        return {
          type: 'quasi-identifier',
          confidence: 0.60,
          reason: 'Date field may contribute to re-identification',
        };
      
      case 'numeric':
        // Numeric values need context
        if (this.hasHighCardinality(values)) {
          return {
            type: 'quasi-identifier',
            confidence: 0.55,
            reason: 'High cardinality numeric field',
          };
        }
        return {
          type: 'non-sensitive',
          confidence: 0.50,
          reason: 'Low cardinality numeric field',
        };
      
      case 'categorical':
        // Low cardinality categorical = likely quasi-identifier or non-sensitive
        const uniqueRatio = this.getUniqueRatio(values);
        if (uniqueRatio < 0.1) {
          return {
            type: 'quasi-identifier',
            confidence: 0.55,
            reason: 'Low cardinality categorical field',
          };
        }
        return {
          type: 'non-sensitive',
          confidence: 0.50,
          reason: 'Categorical field with moderate cardinality',
        };
      
      default:
        return {
          type: 'non-sensitive',
          confidence: this.config.minConfidenceThreshold,
          reason: 'Unable to determine classification, defaulting to non-sensitive',
        };
    }
  }

  /**
   * Detect the data pattern of a column based on its values
   */
  private detectDataPattern(values: string[]): DataPattern {
    const nonEmptyValues = values.filter(v => v.trim() !== '');
    if (nonEmptyValues.length === 0) return 'unknown';

    const sampleSize = Math.min(50, nonEmptyValues.length);
    const sample = nonEmptyValues.slice(0, sampleSize);

    // Check for hash patterns (hex strings of specific lengths)
    const hashPattern = /^[a-f0-9]{8,64}$/i;
    if (sample.every(v => hashPattern.test(v))) {
      return 'hash';
    }

    // Check for date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,  // ISO date
      /^\d{2}\/\d{2}\/\d{4}$/,  // US date
      /^\d{2}-\d{2}-\d{4}$/,  // EU date
      /^\d{4}\/\d{2}\/\d{2}$/,  // Alternative ISO
    ];
    if (sample.every(v => datePatterns.some(p => p.test(v)))) {
      return 'date';
    }

    // Check for boolean
    const boolValues = new Set(['true', 'false', 'yes', 'no', '0', '1', 'y', 'n']);
    if (sample.every(v => boolValues.has(v.toLowerCase()))) {
      return 'boolean';
    }

    // Check for numeric (including decimals)
    const numericPattern = /^-?\d+\.?\d*$/;
    if (sample.every(v => numericPattern.test(v))) {
      return 'numeric';
    }

    // Check for identifier patterns (alphanumeric with specific structure)
    const identifierPattern = /^[A-Z]{1,3}\d{3,}[A-Z]?$/i;
    const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (sample.every(v => identifierPattern.test(v) || uuidPattern.test(v))) {
      return 'identifier';
    }

    // Check for location patterns
    const locationPattern = /^(region|district|city|zone|area)[\s_-]?\d*/i;
    if (sample.every(v => locationPattern.test(v))) {
      return 'location';
    }

    // Check for categorical (low unique ratio)
    const uniqueRatio = this.getUniqueRatio(sample);
    if (uniqueRatio < 0.3) {
      return 'categorical';
    }

    // Default to text
    return 'text';
  }

  /**
   * Get unique sample values for display
   */
  private getSampleValues(values: string[]): string[] {
    const uniqueValues = [...new Set(values.filter(v => v.trim() !== ''))];
    return uniqueValues.slice(0, this.config.sampleSize);
  }

  /**
   * Check if a column has high cardinality (many unique values)
   */
  private hasHighCardinality(values: string[]): boolean {
    const uniqueRatio = this.getUniqueRatio(values);
    return uniqueRatio > 0.8;
  }

  /**
   * Calculate the ratio of unique values to total values
   */
  private getUniqueRatio(values: string[]): number {
    const nonEmpty = values.filter(v => v.trim() !== '');
    if (nonEmpty.length === 0) return 0;
    
    const unique = new Set(nonEmpty);
    return unique.size / nonEmpty.length;
  }

  /**
   * Generate summary statistics for the classification
   */
  private generateSummary(attributes: AttributeClassification[]): ClassificationSummary {
    const totalAttributes = attributes.length;
    const directIdentifiers = attributes.filter(a => a.type === 'direct-identifier').length;
    const quasiIdentifiers = attributes.filter(a => a.type === 'quasi-identifier').length;
    const sensitiveAttributes = attributes.filter(a => a.type === 'sensitive').length;
    const nonSensitiveAttributes = attributes.filter(a => a.type === 'non-sensitive').length;
    
    const totalConfidence = attributes.reduce((sum, a) => sum + a.confidence, 0);
    const averageConfidence = totalAttributes > 0 ? totalConfidence / totalAttributes : 0;

    return {
      totalAttributes,
      directIdentifiers,
      quasiIdentifiers,
      sensitiveAttributes,
      nonSensitiveAttributes,
      averageConfidence,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ClassificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ClassificationConfig {
    return { ...this.config };
  }
}

/**
 * Singleton instance for convenience
 */
export const attributeClassifier = new AttributeClassifier();

/**
 * Helper function to classify a dataset in one call
 */
export function classifyDataset(
  parsedCSV: ParsedCSV,
  config?: Partial<ClassificationConfig>
): ClassificationResult {
  const classifier = new AttributeClassifier(config);
  return classifier.classifyDataset(parsedCSV);
}

/**
 * Update a single attribute's classification (for manual overrides)
 */
export function updateAttributeClassification(
  result: ClassificationResult,
  attributeName: string,
  newType: AttributeType,
  reason?: string
): ClassificationResult {
  const updatedAttributes = result.attributes.map(attr => {
    if (attr.name === attributeName) {
      return {
        ...attr,
        type: newType,
        confidence: 1.0, // Manual override = 100% confidence
        isManualOverride: true,
        classificationReason: reason || `Manually classified as ${newType}`,
      };
    }
    return attr;
  });

  // Recalculate summary
  const summary: ClassificationSummary = {
    totalAttributes: updatedAttributes.length,
    directIdentifiers: updatedAttributes.filter(a => a.type === 'direct-identifier').length,
    quasiIdentifiers: updatedAttributes.filter(a => a.type === 'quasi-identifier').length,
    sensitiveAttributes: updatedAttributes.filter(a => a.type === 'sensitive').length,
    nonSensitiveAttributes: updatedAttributes.filter(a => a.type === 'non-sensitive').length,
    averageConfidence: updatedAttributes.reduce((sum, a) => sum + a.confidence, 0) / updatedAttributes.length,
  };

  return {
    ...result,
    attributes: updatedAttributes,
    summary,
  };
}
