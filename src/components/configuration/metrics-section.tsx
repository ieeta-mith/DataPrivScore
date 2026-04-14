
import { AnimatePresence, motion } from "motion/react";

import { CheckCircle2, HelpCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { ThresholdConfig } from "@/components/configuration/threshold-config";
import { Label } from "@/components/ui/label";

import { containerVariants, itemVariants, L_DIVERSITY_TYPES, METRIC_CONFIGS } from "@/utils/constants";
import { METRIC_INFO, METRIC_THRESHOLDS } from "@/types/privacy-analysis";

import type { MetricKey } from "@/types/configuration";
import type { LDiversityType, PrivacyAnalysisConfig } from "@/types/privacy-analysis";

interface MetricsSectionProps {
  config: PrivacyAnalysisConfig;
  onToggleMetric: (key: MetricKey, enabled: boolean) => void;
  onThresholdChange: (key: 'kThreshold' | 'lThreshold' | 'tThreshold', value: number) => void;
  onLDiversityTypeChange: (type: LDiversityType) => void;
  getThresholdValue: (key: keyof typeof METRIC_THRESHOLDS) => number;
  getThresholdKey: (key: keyof typeof METRIC_THRESHOLDS) => 'kThreshold' | 'lThreshold' | 'tThreshold';
}

export const MetricsSection =({
  config,
  onToggleMetric,
  onThresholdChange,
  onLDiversityTypeChange,
  getThresholdValue,
  getThresholdKey,
}: MetricsSectionProps) => {
  return (
    <motion.div variants={containerVariants} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Select Metrics to Evaluate</h2>
      </div>

      {METRIC_CONFIGS.map((metricConfig) => {
        const info = METRIC_INFO[metricConfig.key];
        const isEnabled = config.enabledMetrics[metricConfig.key];
        const Icon = metricConfig.icon;

        return (
          <motion.div key={metricConfig.key} variants={itemVariants}>
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