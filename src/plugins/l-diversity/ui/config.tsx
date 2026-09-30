import { AnimatePresence, motion } from 'motion/react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

import type { PluginConfigProps } from '@/types/privacy-plugins';
import type { LDiversityConfig, LDiversityType } from '../types';


const L_DIVERSITY_TYPES: { value: LDiversityType; label: string; description: string }[] = [
	{ value: 'distinct', label: 'Distinct', description: 'Count of unique sensitive values' },
	{ value: 'entropy', label: 'Entropy', description: 'Information-theoretic diversity measure' },
	{ value: 'recursive', label: 'Recursive', description: 'Most restrictive, frequency-based' },
];

export function LDiversityInlineConfig({ config, onChange }: PluginConfigProps<LDiversityConfig>) {
	const min = 2;
	const max = 10;

	const handleThresholdChange = (val: number) => {
		const boundedValue = Math.max(min, Math.min(max, val));
		onChange({ ...config, lThreshold: boundedValue });
	}

	const handleTypeChange = (val: LDiversityType) => {
		onChange({ ...config, diversityType: val });
	}

  const handleCValueChange = (val: number) => {
    onChange({ ...config, cValue: Math.max(0.1, Math.min(10, val)) });
  }

	return (
    <div className="space-y-6 mt-5 pt-5 border-t">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">L-Diversity Threshold (l)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={config.lThreshold}
              onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 2)}
              min={2}
              max={10}
              className="w-24 h-9 text-center"
            />
            <span className="text-xs text-muted-foreground">values</span>
          </div>
        </div>
        <Slider
          value={[config.lThreshold]}
          onValueChange={([val]) => handleThresholdChange(val)}
          min={2}
          max={10}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Minimum distinct sensitive values per group
        </p>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-sm text-muted-foreground mb-3 block">
          L-Diversity Type
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {L_DIVERSITY_TYPES.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeChange(type.value)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                config.diversityType === type.value
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
      </div>
      <AnimatePresence>
        {config.diversityType === 'recursive' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Dominance Multiplier (c-value)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.cValue}
                    onChange={(e) => handleCValueChange(parseFloat(e.target.value) || 2)}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="w-24 h-9 text-center"
                  />
                  <span className="text-xs text-muted-foreground">multiplier</span>
                </div>
              </div>
              <Slider
                value={[config.cValue || 2]}
                onValueChange={([val]) => handleCValueChange(val)}
                min={0.1}
                max={10}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Maximum allowed frequency ratio between the most common sensitive value and the remaining tail values.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}