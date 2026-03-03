import { useState, useEffect, useCallback, useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Settings2,
  Info,
  AlertTriangle,
  CheckCircle2,
  Users,
  Layers,
  Activity,
  Search,
  Shield,
  RotateCcw,
  HelpCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Hash,
  UserX,
  Key,
  Waves,
  Shuffle,
  BarChart3,
  Archive,
  FileSpreadsheet,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, AnimatedButton } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  MetricToggle,
  TechniqueToggle,
} from '@/types/privacy-analysis';
import {
  DEFAULT_PRIVACY_CONFIG,
  METRIC_THRESHOLDS,
  METRIC_INFO,
  TECHNIQUE_INFO,
} from '@/types/privacy-analysis';

export const Route = createFileRoute('/configure')({
  component: ConfigurePage,
});

type MetricKey = keyof MetricToggle;
type TechniqueKey = keyof TechniqueToggle;

interface MetricConfig {
  key: MetricKey;
  icon: typeof Users;
  hasThreshold: boolean;
  thresholdKey?: keyof typeof METRIC_THRESHOLDS;
  color: string;
}

const METRIC_CONFIGS: MetricConfig[] = [
  { key: 'kAnonymity', icon: Users, hasThreshold: true, thresholdKey: 'kAnonymity', color: 'blue' },
  { key: 'lDiversity', icon: Layers, hasThreshold: true, thresholdKey: 'lDiversity', color: 'purple' },
  { key: 'tCloseness', icon: Activity, hasThreshold: true, thresholdKey: 'tCloseness', color: 'cyan' },
  { key: 'techniqueDetection', icon: Search, hasThreshold: false, color: 'amber' },
  { key: 'reidentificationRisk', icon: Shield, hasThreshold: false, color: 'red' },
];

const TECHNIQUE_ICONS: Record<TechniqueKey, typeof Layers> = {
  generalization: Layers,
  suppression: EyeOff,
  masking: Eye,
  hashing: Hash,
  pseudonymization: UserX,
  tokenization: Key,
  noiseAddition: Waves,
  dataSwapping: Shuffle,
  aggregation: BarChart3,
  bucketing: Archive,
};

const L_DIVERSITY_TYPES: { value: LDiversityType; label: string; description: string }[] = [
  { value: 'distinct', label: 'Distinct', description: 'Count of unique sensitive values' },
  { value: 'entropy', label: 'Entropy', description: 'Information-theoretic diversity measure' },
  { value: 'recursive', label: 'Recursive', description: 'Most restrictive, frequency-based' },
];

function getThresholdWarning(
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
    () => Object.values(config.enabledTechniques).filter(Boolean).length,
    [config.enabledTechniques]
  );

  const handleToggleMetric = useCallback(
    (key: MetricKey, enabled: boolean) => {
      const newConfig = {
        ...config,
        enabledMetrics: { ...config.enabledMetrics, [key]: enabled },
      };
      setConfig(newConfig);
      setPrivacyConfig(newConfig);
    },
    [config]
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

  const weightWarning = (() => {
    const enabledWeightSum = Object.entries(config.metricWeights)
      .filter(([key]) => config.enabledMetrics[key as MetricKey])
      .reduce((sum, [, weight]) => sum + weight, 0);

    if (Math.abs(enabledWeightSum - 1) > 0.01) {
      return `Enabled metric weights sum to ${(enabledWeightSum * 100).toFixed(0)}%. Consider adjusting to total 100%.`;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Classification
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings2 className="h-6 w-6 text-primary" />
                  </div>
                  Privacy Analysis Configuration
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{fileName}</span>
                  <span>•</span>
                  <span>Configure analysis parameters before calculation</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetConfig}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Defaults
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Guide */}
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
              { id: 'metrics', label: 'Privacy Metrics', count: enabledMetricsCount },
              { id: 'techniques', label: 'Technique Detection', count: enabledTechniquesCount },
              { id: 'weights', label: 'Score Weights', count: null },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as typeof activeSection)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.label}
                {section.count !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {section.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <TechniquesSection
                config={config}
                onToggleTechnique={handleToggleTechnique}
                onToggleAll={toggleAllTechniques}
                enabledCount={enabledTechniquesCount}
              />
            </motion.div>
          )}

          {activeSection === 'weights' && (
            <motion.div
              key="weights"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <WeightsSection
                config={config}
                onWeightChange={handleWeightChange}
                onNormalize={normalizeWeights}
                warning={weightWarning}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Footer */}
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
                  disabled={isCalculating || enabledMetricsCount === 0}
                  className="whitespace-nowrap"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
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

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            🔒 All processing happens in your browser. No data is sent to external servers.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Metrics Section
// ============================================================================

interface MetricsSectionProps {
  config: PrivacyAnalysisConfig;
  onToggleMetric: (key: MetricKey, enabled: boolean) => void;
  onThresholdChange: (key: 'kThreshold' | 'lThreshold' | 'tThreshold', value: number) => void;
  onLDiversityTypeChange: (type: LDiversityType) => void;
  getThresholdValue: (key: keyof typeof METRIC_THRESHOLDS) => number;
  getThresholdKey: (key: keyof typeof METRIC_THRESHOLDS) => 'kThreshold' | 'lThreshold' | 'tThreshold';
}

function MetricsSection({
  config,
  onToggleMetric,
  onThresholdChange,
  onLDiversityTypeChange,
  getThresholdValue,
  getThresholdKey,
}: MetricsSectionProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Select Metrics to Evaluate</h2>
      </div>

      {METRIC_CONFIGS.map((metricConfig) => {
        const info = METRIC_INFO[metricConfig.key];
        const isEnabled = config.enabledMetrics[metricConfig.key];
        const Icon = metricConfig.icon;

        return (
          <motion.div key={metricConfig.key} variants={item}>
            <Card
              className={`transition-all duration-200 ${
                isEnabled
                  ? 'border-primary/50 bg-primary/5 shadow-md'
                  : 'border-muted bg-muted/30 opacity-70'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ scale: isEnabled ? 1 : 0.9 }}
                      className={`p-3 rounded-xl ${
                        isEnabled ? 'bg-primary/10' : 'bg-muted'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isEnabled ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </motion.div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{info.name}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>{info.guidance}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">{info.shortDescription}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => onToggleMetric(metricConfig.key, checked)}
                  />
                </div>

                {/* Threshold Configuration */}
                <AnimatePresence>
                  {isEnabled && metricConfig.hasThreshold && metricConfig.thresholdKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-5 pt-5 border-t"
                    >
                      <ThresholdConfig
                        metricKey={metricConfig.thresholdKey}
                        value={getThresholdValue(metricConfig.thresholdKey)}
                        onChange={(value) =>
                          onThresholdChange(getThresholdKey(metricConfig.thresholdKey!), value)
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* L-Diversity Type Selection */}
                <AnimatePresence>
                  {isEnabled && metricConfig.key === 'lDiversity' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t"
                    >
                      <Label className="text-sm text-muted-foreground mb-3 block">
                        L-Diversity Type
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {L_DIVERSITY_TYPES.map((type) => (
                          <motion.button
                            key={type.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onLDiversityTypeChange(type.value)}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              config.lDiversityType === type.value
                                ? 'border-primary bg-primary/10'
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <span className="text-sm font-medium block">{type.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {type.description}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ============================================================================
// Techniques Section
// ============================================================================

interface TechniquesSectionProps {
  config: PrivacyAnalysisConfig;
  onToggleTechnique: (key: TechniqueKey, enabled: boolean) => void;
  onToggleAll: (enabled: boolean) => void;
  enabledCount: number;
}

function TechniquesSection({
  config,
  onToggleTechnique,
  onToggleAll,
  enabledCount,
}: TechniquesSectionProps) {
  const totalTechniques = Object.keys(config.enabledTechniques).length;
  const allEnabled = enabledCount === totalTechniques;
  const noneEnabled = enabledCount === 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Privacy Techniques to Detect</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(true)}
            disabled={allEnabled}
          >
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(false)}
            disabled={noneEnabled}
          >
            Disable All
          </Button>
        </div>
      </div>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                What are Privacy Techniques?
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Privacy techniques are methods applied to data to protect individual privacy while
                maintaining data utility. Select which techniques you want to detect in your
                dataset.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(TECHNIQUE_INFO) as TechniqueKey[]).map((techKey) => {
          const info = TECHNIQUE_INFO[techKey];
          const isEnabled = config.enabledTechniques[techKey];
          const Icon = TECHNIQUE_ICONS[techKey];

          return (
            <motion.div key={techKey} variants={item}>
              <Card
                className={`transition-all duration-200 cursor-pointer h-full ${
                  isEnabled
                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                    : 'border-muted bg-muted/30 opacity-70'
                }`}
                onClick={() => onToggleTechnique(techKey, !isEnabled)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ scale: isEnabled ? 1 : 0.9 }}
                        className={`p-2 rounded-lg ${
                          isEnabled ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isEnabled ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </motion.div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{info.name}</span>
                          <Badge
                            variant={
                              info.privacyBenefit === 'high'
                                ? 'default'
                                : info.privacyBenefit === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-xs"
                          >
                            {info.privacyBenefit} benefit
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => onToggleTechnique(techKey, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Weights Section
// ============================================================================

interface WeightsSectionProps {
  config: PrivacyAnalysisConfig;
  onWeightChange: (key: MetricKey, value: number) => void;
  onNormalize: () => void;
  warning: string | null;
}

function WeightsSection({ config, onWeightChange, onNormalize, warning }: WeightsSectionProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Score Weights</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onNormalize}>
          Normalize to 100%
        </Button>
      </div>

      {warning && (
        <motion.div variants={item}>
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
            <CardContent className="p-4">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">{warning}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card className='p-6'>
          <CardHeader>
            <CardTitle className="text-base">Metric Weight Distribution</CardTitle>
            <CardDescription>
              Adjust how much each metric contributes to the final privacy score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {METRIC_CONFIGS.map((metricConfig) => {
              const isEnabled = config.enabledMetrics[metricConfig.key];
              const weight = config.metricWeights[metricConfig.key];
              const info = METRIC_INFO[metricConfig.key];
              const Icon = metricConfig.icon;

              return (
                <motion.div
                  key={metricConfig.key}
                  animate={{ opacity: isEnabled ? 1 : 0.4 }}
                  className={`transition-opacity ${!isEnabled ? 'pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-48 shrink-0">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">{info.name}</span>
                    </div>
                    <Slider
                      value={[weight * 100]}
                      onValueChange={([val]) => onWeightChange(metricConfig.key, val / 100)}
                      min={0}
                      max={100}
                      step={5}
                      disabled={!isEnabled}
                      className="flex-1"
                    />
                    <div className="w-16 text-right">
                      <span className="text-sm font-mono">{(weight * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Threshold Config Component
// ============================================================================

interface ThresholdConfigProps {
  metricKey: keyof typeof METRIC_THRESHOLDS;
  value: number;
  onChange: (value: number) => void;
}

function ThresholdConfig({ metricKey, value, onChange }: ThresholdConfigProps) {
  const thresholdInfo = METRIC_THRESHOLDS[metricKey];
  const warning = getThresholdWarning(metricKey, value);
  const isInRecommendedRange =
    value >= thresholdInfo.recommended.min && value <= thresholdInfo.recommended.max;

  const step = metricKey === 'tCloseness' ? 0.01 : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{thresholdInfo.label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || thresholdInfo.min)}
            min={thresholdInfo.min}
            max={thresholdInfo.max}
            step={step}
            className="w-24 h-9 text-center"
          />
          {thresholdInfo.unit && (
            <span className="text-xs text-muted-foreground">{thresholdInfo.unit}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={([val]) => onChange(val)}
          min={thresholdInfo.min}
          max={thresholdInfo.max}
          step={step}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{thresholdInfo.min}</span>
          <span
            className={
              isInRecommendedRange ? 'text-green-600 dark:text-green-400 font-medium' : ''
            }
          >
            Recommended: {thresholdInfo.recommended.min}-{thresholdInfo.recommended.max}
          </span>
          <span>{thresholdInfo.max}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{thresholdInfo.description}</p>

      <AnimatePresence>
        {warning.type && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
              warning.type === 'low'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'
                : 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{warning.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConfigurePage;
