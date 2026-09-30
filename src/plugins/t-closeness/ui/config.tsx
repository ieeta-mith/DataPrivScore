import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

import type { PluginConfigProps } from '@/types/privacy-plugins';
import type { TClosenessConfig } from '../types';

export function TClosenessInlineConfig({ config, onChange }: PluginConfigProps<TClosenessConfig>) {
	const min = 0.01;
	const max = 5;
	const step = 0.01;

	const handleThresholdChange = (val: number) => {
		const boundedValue = Math.max(min, Math.min(max, val));
		onChange({ ...config, tThreshold: boundedValue });
	}

	return (
		<div className="space-y-4 mt-5 pt-5 border-t">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">T-Closeness Threshold (t)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={config.tThreshold}
            onChange={(e) => handleThresholdChange(parseFloat(e.target.value) || min)}
            min={min}
            max={max}
            step={step}
            className="w-24 h-9 text-center"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[config.tThreshold]}
          onValueChange={([val]) => handleThresholdChange(val)}
          min={min}
          max={max}
          step={step}
        />
				<div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Maximum allowed distance between the local group distribution and the global dataset distribution. Lower values are stricter.
      </p>
    </div>
	);
}