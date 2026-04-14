import type { MetricKey } from "@/types/configuration";
import { METRIC_INFO, type PrivacyAnalysisConfig } from "@/types/privacy-analysis";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedButton } from "@/components/ui/button";
import { containerVariants, itemVariants, METRIC_CONFIGS } from "@/utils/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface WeightsSectionProps {
  config: PrivacyAnalysisConfig;
  onWeightChange: (key: MetricKey, value: number) => void;
  onNormalize: () => void;
  warning: string | null;
}

export const WeightsSection = ({ config, onWeightChange, onNormalize, warning }: WeightsSectionProps) => {
  return (
    <motion.div variants={containerVariants} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Score Weights</h2>
        </div>
        <AnimatedButton variant="outline" size="sm" onClick={onNormalize}>
          Normalize to 100%
        </AnimatedButton>
      </div>

      <AnimatePresence>
        {warning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                <CardContent className="p-4">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">{warning}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants}>
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