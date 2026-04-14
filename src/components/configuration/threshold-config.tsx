import { getThresholdWarning } from '@/lib/utils';
import { METRIC_THRESHOLDS } from '@/utils/constants';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ThresholdConfigProps {
	metricKey: keyof typeof METRIC_THRESHOLDS;
	value: number;
	onChange: (value: number) => void;
}

export const ThresholdConfig = ({ metricKey, value, onChange }: ThresholdConfigProps) => {
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
