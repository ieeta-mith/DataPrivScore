import { useState, useEffect, useCallback, useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Info,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button, AnimatedButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { calculatePrivacyIndex } from '@/services/privacy';

import {
  getClassificationData,
  getPrivacyConfig,
  setPrivacyConfig,
  setPrivacyResultData,
} from '@/lib/storage';

import type { ClassificationResult } from '@/types/attribute-classification';
import type { ParsedCSV } from '@/types/csv-parser';
import type {
  PrivacyAnalysisConfig,
  LDiversityType,
  TechniqueToggle,
} from '@/types/privacy-analysis';
import {
  DEFAULT_PRIVACY_CONFIG,
  METRIC_THRESHOLDS,
} from '@/types/privacy-analysis';
import type { MetricKey, TechniqueKey } from '@/types/configuration';
import { MetricsSection } from '@/components/configuration/metrics-section';
import { TechniquesSection } from '@/components/configuration/techniques-section';
import { WeightsSection } from '@/components/configuration/weights-section';
import { tabVariants } from '@/utils/constants';
import { PageHeader } from '@/components/page-header';
import { PrivacyNote } from '@/components/privacy-note';

export const Route = createFileRoute('/configure')({
  component: ConfigurePage,
});

function ConfigurePage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [config, setConfig] = useState<PrivacyAnalysisConfig>(getPrivacyConfig());
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeSection, setActiveSection] = useState<'metrics' | 'techniques' | 'weights'>('metrics');

  useEffect(() => {
    const data = getClassificationData();
    if (data.result && data.parsedCSV && data.fileName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(data.result);
      setParsedCSV(data.parsedCSV);
      setFileName(data.fileName);
    } else {
      navigate({ to: '/' });
    }
  }, [navigate]);

  const enabledMetricsCount = useMemo(
    () => Object.values(config.enabledMetrics).filter(Boolean).length,
    [config.enabledMetrics]
  );

  const enabledTechniquesCount = useMemo(
    () => {
      if (!config.enabledMetrics.techniqueDetection) return null;
      return Object.values(config.enabledTechniques).filter(Boolean).length;
    },
    [config.enabledTechniques, config.enabledMetrics.techniqueDetection]
  );

  const handleToggleMetric = useCallback(
    (key: MetricKey, enabled: boolean) => {
      const newConfig = {
        ...config,
        enabledMetrics: { ...config.enabledMetrics, [key]: enabled },
      };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);

      if (key === 'techniqueDetection' && !enabled && activeSection === 'techniques') {
        setActiveSection('metrics');
      }
    },
    [config, activeSection]
  );

  const handleToggleTechnique = useCallback(
    (key: TechniqueKey, enabled: boolean) => {
      const newConfig = {
        ...config,
        enabledTechniques: { ...config.enabledTechniques, [key]: enabled },
      };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);
    },
    [config]
  );

  const handleThresholdChange = useCallback(
    (key: 'kThreshold' | 'lThreshold' | 'tThreshold', value: number) => {
      const newConfig = { ...config, [key]: value };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);
    },
    [config]
  );

  const handleWeightChange = useCallback(
    (key: MetricKey, value: number) => {
      const newConfig = {
        ...config,
        metricWeights: { ...config.metricWeights, [key]: value },
      };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);
    },
    [config]
  );

  const handleLDiversityTypeChange = useCallback(
    (type: LDiversityType) => {
      const newConfig = { ...config, lDiversityType: type };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);
    },
    [config]
  );

  const handleResetConfig = useCallback(() => {
    setConfig(DEFAULT_PRIVACY_CONFIG);
    setPrivacyConfig(DEFAULT_PRIVACY_CONFIG);
  }, []);

  const normalizeWeights = useCallback(() => {
    const enabledWeights = Object.entries(config.metricWeights).filter(
      ([key]) => config.enabledMetrics[key as MetricKey]
    );
    const totalWeight = enabledWeights.reduce((sum, [, weight]) => sum + weight, 0);

    if (totalWeight === 0) return;

    const newWeights = { ...config.metricWeights };
    enabledWeights.forEach(([key]) => {
      newWeights[key as MetricKey] = config.metricWeights[key as MetricKey] / totalWeight;
    });

    const newConfig = { ...config, metricWeights: newWeights };
    setConfig(newConfig);
    setPrivacyConfig(newConfig);
  }, [config]);

  const toggleAllTechniques = useCallback(
    (enabled: boolean) => {
      const newTechniques: TechniqueToggle = {
        generalization: enabled,
        suppression: enabled,
        masking: enabled,
        hashing: enabled,
        pseudonymization: enabled,
        tokenization: enabled,
        noiseAddition: enabled,
        dataSwapping: enabled,
        aggregation: enabled,
        bucketing: enabled,
      };
      const newConfig = { ...config, enabledTechniques: newTechniques };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);
    },
    [config]
  );

  const getThresholdValue = (metricKey: keyof typeof METRIC_THRESHOLDS): number => {
    switch (metricKey) {
      case 'kAnonymity':
        return config.kThreshold;
      case 'lDiversity':
        return config.lThreshold;
      case 'tCloseness':
        return config.tThreshold;
      default:
        return 0;
    }
  };

  const getThresholdKey = (
    metricKey: keyof typeof METRIC_THRESHOLDS
  ): 'kThreshold' | 'lThreshold' | 'tThreshold' => {
    switch (metricKey) {
      case 'kAnonymity':
        return 'kThreshold';
      case 'lDiversity':
        return 'lThreshold';
      case 'tCloseness':
        return 'tThreshold';
    }
  };

  const handleCalculatePrivacyIndex = async () => {
    if (!result || !parsedCSV || !fileName) return;

    setIsCalculating(true);

    setTimeout(() => {
      try {
        const privacyResult = calculatePrivacyIndex({
          parsedCSV,
          classification: result,
          config,
        });

        setPrivacyResultData(privacyResult, result, parsedCSV, fileName);
        navigate({ to: '/results' });
      } catch (error) {
        console.error('Error calculating privacy index:', error);
        setIsCalculating(false);
      }
    }, 2000);
  };

  const handleBack = () => {
    navigate({ to: '/classify' });
  };

  const enabledWeightSum = useMemo(() => {
    return Object.entries(config.metricWeights)
      .filter(([key]) => config.enabledMetrics[key as MetricKey])
      .reduce((sum, [, weight]) => sum + weight, 0);
  }, [config]);

  const totalPercentage = Math.round(enabledWeightSum * 100);

  const weightError = totalPercentage !== 100 ?
    `Enabled metric weights sum to ${totalPercentage}%. Consider adjusting to total 100%.` 
    : null;

  if (!result) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Privacy Analysis Configuration"
          backDescription="Back to Classification"
          handleFunc={handleBack}
          subTitle={
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{fileName}</span>
              <span>•</span>
              <span>Configure analysis parameters before calculation</span>
            </div>
          }
          actionSection={
            <Button variant="outline" size="sm" onClick={handleResetConfig}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    How to configure your privacy analysis
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Select which privacy metrics to evaluate for your dataset</li>
                    <li>Adjust thresholds based on your privacy requirements</li>
                    <li>Choose which privacy techniques to detect in your data</li>
                    <li>Customize weights to prioritize certain metrics in the final score</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            {[
              { id: 'metrics', label: 'Privacy Metrics', count: enabledMetricsCount, disabled: false },
              { id: 'techniques', label: 'Technique Detection', count: enabledTechniquesCount, disabled: !config.enabledMetrics.techniqueDetection },
              { id: 'weights', label: 'Score Weights', count: null, disabled: false },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => !section.disabled && setActiveSection(section.id as typeof activeSection)}
                disabled={section.disabled}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-background shadow text-foreground'
                    : section.disabled 
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.label}
                {section.count !== null && (
                  <Badge variant="secondary" className={`text-xs ${section.disabled ? 'opacity-50' : ''}`}>
                    {section.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeSection === 'metrics' && (
            <motion.div
              key="metrics"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MetricsSection
                config={config}
                onToggleMetric={handleToggleMetric}
                onThresholdChange={handleThresholdChange}
                onLDiversityTypeChange={handleLDiversityTypeChange}
                getThresholdValue={getThresholdValue}
                getThresholdKey={getThresholdKey}
              />
            </motion.div>
          )}

          {activeSection === 'techniques' && (
            <motion.div
              key="techniques"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TechniquesSection
                config={config}
                onToggleTechnique={handleToggleTechnique}
                onToggleAll={toggleAllTechniques}
                enabledCount={enabledTechniquesCount || 0}
              />
            </motion.div>
          )}

          {activeSection === 'weights' && (
            <motion.div
              key="weights"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <WeightsSection
                config={config}
                onWeightChange={handleWeightChange}
                onNormalize={normalizeWeights}
                warning={weightError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6">
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Ready to Calculate Privacy Index?</h3>
                  <p className="text-sm text-muted-foreground">
                    {enabledMetricsCount} metrics and {enabledTechniquesCount} techniques will be
                    evaluated.
                  </p>
                </div>
                <AnimatedButton
                  size="lg"
                  onClick={handleCalculatePrivacyIndex}
                  disabled={isCalculating || enabledMetricsCount === 0 || weightError !== null}
                  className="whitespace-nowrap"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Privacy Index
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warnings */}
        {enabledMetricsCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4"
          >
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Please enable at least one metric to perform the analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <PrivacyNote />
      </div>
    </div>
  );
}

export default ConfigurePage;
