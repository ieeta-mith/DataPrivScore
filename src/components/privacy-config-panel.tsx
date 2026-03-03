import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings2,
  Info,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  Layers,
  Activity,
  Search,
  Shield,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, AnimatedButton } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { PrivacyAnalysisConfig, LDiversityType, MetricToggle } from '@/types/privacy-analysis';
import {
  DEFAULT_PRIVACY_CONFIG,
  METRIC_THRESHOLDS,
  METRIC_INFO,
} from '@/types/privacy-analysis';

interface PrivacyConfigPanelProps {
  config: PrivacyAnalysisConfig;
  onConfigChange: (config: PrivacyAnalysisConfig) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

type MetricKey = keyof MetricToggle;

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

function getWeightWarning(weights: PrivacyAnalysisConfig['metricWeights'], enabledMetrics: MetricToggle): string | null {
  const enabledWeightSum = Object.entries(weights)
    .filter(([key]) => enabledMetrics[key as MetricKey])
    .reduce((sum, [, weight]) => sum + weight, 0);

  if (Math.abs(enabledWeightSum - 1) > 0.01) {
    return `Enabled metric weights sum to ${(enabledWeightSum * 100).toFixed(0)}%. Consider adjusting to total 100%.`;
  }
  return null;
}

export function PrivacyConfigPanel({
  config,
  onConfigChange,
  onCalculate,
  isCalculating,
}: PrivacyConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const enabledMetricsCount = useMemo(
    () => Object.values(config.enabledMetrics).filter(Boolean).length,
    [config.enabledMetrics]
  );

  const weightWarning = useMemo(
    () => getWeightWarning(config.metricWeights, config.enabledMetrics),
    [config.metricWeights, config.enabledMetrics]
  );

  const handleToggleMetric = useCallback(
    (key: MetricKey, enabled: boolean) => {
      const newConfig = {
        ...config,
        enabledMetrics: { ...config.enabledMetrics, [key]: enabled },
      };
      onConfigChange(newConfig);
    },
    [config, onConfigChange]
  );

  const handleThresholdChange = useCallback(
    (key: 'kThreshold' | 'lThreshold' | 'tThreshold', value: number) => {
      onConfigChange({ ...config, [key]: value });
    },
    [config, onConfigChange]
  );

  const handleWeightChange = useCallback(
    (key: MetricKey, value: number) => {
      const newConfig = {
        ...config,
        metricWeights: { ...config.metricWeights, [key]: value },
      };
      onConfigChange(newConfig);
    },
    [config, onConfigChange]
  );

  const handleLDiversityTypeChange = useCallback(
    (type: LDiversityType) => {
      onConfigChange({ ...config, lDiversityType: type });
    },
    [config, onConfigChange]
  );

  const handleResetConfig = useCallback(() => {
    onConfigChange(DEFAULT_PRIVACY_CONFIG);
  }, [onConfigChange]);

  const normalizeWeights = useCallback(() => {
    const enabledWeights = Object.entries(config.metricWeights)
      .filter(([key]) => config.enabledMetrics[key as MetricKey]);
    const totalWeight = enabledWeights.reduce((sum, [, weight]) => sum + weight, 0);
    
    if (totalWeight === 0) return;

    const newWeights = { ...config.metricWeights };
    enabledWeights.forEach(([key]) => {
      newWeights[key as MetricKey] = config.metricWeights[key as MetricKey] / totalWeight;
    });
    
    onConfigChange({ ...config, metricWeights: newWeights });
  }, [config, onConfigChange]);

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

  const getThresholdKey = (metricKey: keyof typeof METRIC_THRESHOLDS): 'kThreshold' | 'lThreshold' | 'tThreshold' => {
    switch (metricKey) {
      case 'kAnonymity':
        return 'kThreshold';
      case 'lDiversity':
        return 'lThreshold';
      case 'tCloseness':
        return 'tThreshold';
    }
  };

  return (
    <Card className="border-2 p-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Privacy Analysis Configuration</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Customize thresholds and select metrics for evaluation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {enabledMetricsCount} metrics enabled
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-6 pt-0">
              {/* Quick Guide */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      How to configure your privacy analysis
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                      <li>Toggle metrics on/off based on your dataset characteristics</li>
                      <li>Adjust thresholds based on your privacy requirements</li>
                      <li>Higher thresholds = stricter privacy but may reduce data utility</li>
                      <li>Weights determine each metric's contribution to the final score</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Metrics Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Select Metrics to Evaluate
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {METRIC_CONFIGS.map((metricConfig) => {
                    const info = METRIC_INFO[metricConfig.key];
                    const isEnabled = config.enabledMetrics[metricConfig.key];
                    const Icon = metricConfig.icon;

                    return (
                      <div
                        key={metricConfig.key}
                        className={`border rounded-lg p-4 transition-colors ${
                          isEnabled
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-muted bg-muted/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${metricConfig.color}-100 dark:bg-${metricConfig.color}-900/30`}>
                              <Icon className={`h-4 w-4 text-${metricConfig.color}-600 dark:text-${metricConfig.color}-400`} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{info.name}</span>
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
                            onCheckedChange={(checked) => handleToggleMetric(metricConfig.key, checked)}
                          />
                        </div>

                        {/* Threshold Configuration */}
                        {isEnabled && metricConfig.hasThreshold && metricConfig.thresholdKey && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <ThresholdConfig
                              metricKey={metricConfig.thresholdKey}
                              value={getThresholdValue(metricConfig.thresholdKey)}
                              onChange={(value) =>
                                handleThresholdChange(getThresholdKey(metricConfig.thresholdKey!), value)
                              }
                            />
                          </motion.div>
                        )}

                        {/* L-Diversity Type Selection */}
                        {isEnabled && metricConfig.key === 'lDiversity' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <Label className="text-sm text-muted-foreground mb-3 block">
                              L-Diversity Type
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                              {L_DIVERSITY_TYPES.map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => handleLDiversityTypeChange(type.value)}
                                  className={`p-3 rounded-lg border text-left transition-colors ${
                                    config.lDiversityType === type.value
                                      ? 'border-primary bg-primary/10'
                                      : 'border-muted hover:border-primary/50'
                                  }`}
                                >
                                  <span className="text-sm font-medium block">{type.label}</span>
                                  <span className="text-xs text-muted-foreground">{type.description}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Advanced Settings (Metric Weights)
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {weightWarning && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                          <div className="flex gap-2 items-start">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">{weightWarning}</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Adjust how much each metric contributes to the final privacy score
                          </p>
                          <Button variant="outline" size="sm" onClick={normalizeWeights}>
                            Normalize to 100%
                          </Button>
                        </div>

                        {METRIC_CONFIGS.map((metricConfig) => {
                          const isEnabled = config.enabledMetrics[metricConfig.key];
                          const weight = config.metricWeights[metricConfig.key];
                          const info = METRIC_INFO[metricConfig.key];

                          return (
                            <div
                              key={metricConfig.key}
                              className={`flex items-center gap-4 ${!isEnabled ? 'opacity-40' : ''}`}
                            >
                              <div className="w-40 shrink-0">
                                <span className="text-sm font-medium">{info.name}</span>
                              </div>
                              <Slider
                                value={[weight * 100]}
                                onValueChange={([val]) =>
                                  handleWeightChange(metricConfig.key, val / 100)
                                }
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
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={handleResetConfig}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
                <AnimatedButton size="lg" onClick={onCalculate} disabled={isCalculating || enabledMetricsCount === 0}>
                  {isCalculating ? 'Calculating...' : 'Calculate Privacy Index'}
                </AnimatedButton>
              </div>

              {enabledMetricsCount === 0 && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex gap-2 items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Please enable at least one metric to perform the analysis.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Summary View */}
      {!isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>k={config.kThreshold}</span>
              <span>l={config.lThreshold}</span>
              <span>t={config.tThreshold}</span>
            </div>
            <AnimatedButton onClick={onCalculate} disabled={isCalculating || enabledMetricsCount === 0}>
              {isCalculating ? 'Calculating...' : 'Calculate Privacy Index'}
            </AnimatedButton>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

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
  
  // Calculate percentage for value indicator position
  const percentage = ((value - thresholdInfo.min) / (thresholdInfo.max - thresholdInfo.min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{thresholdInfo.label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || thresholdInfo.min)}
            min={thresholdInfo.min}
            max={thresholdInfo.max}
            step={step}
            className="w-20 h-8 text-center"
          />
          {thresholdInfo.unit && (
            <span className="text-xs text-muted-foreground">{thresholdInfo.unit}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative pt-5">
          {/* Value indicator bubble */}
          <div 
            className="absolute top-0 transform -translate-x-1/2 z-10"
            style={{ left: `${Math.min(Math.max(percentage, 5), 95)}%` }}
          >
            <div className={`px-2 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground shadow-sm`}>
              {metricKey === 'tCloseness' ? value.toFixed(2) : value}
            </div>
          </div>
          <Slider
            value={[value]}
            onValueChange={([val]) => onChange(val)}
            min={thresholdInfo.min}
            max={thresholdInfo.max}
            step={step}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{thresholdInfo.min}</span>
          <span className={isInRecommendedRange ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
            Recommended: {thresholdInfo.recommended.min}-{thresholdInfo.recommended.max}
          </span>
          <span>{thresholdInfo.max}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{thresholdInfo.description}</p>

      {warning.type && (
        <div
          className={`flex items-start gap-2 p-2 rounded-md text-xs ${
            warning.type === 'low'
              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'
              : 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{warning.message}</span>
        </div>
      )}
    </div>
  );
}

export default PrivacyConfigPanel;
