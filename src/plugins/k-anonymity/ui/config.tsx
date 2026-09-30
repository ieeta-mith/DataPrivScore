import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { PluginConfigProps } from '@/types/privacy-plugins';
import type { KAnonymityConfig } from '../types';

export function KAnonymityInlineConfig({ config, onChange }: PluginConfigProps<KAnonymityConfig>) {
  const min = 2;
  const max = 20;

  const handleValueChange = (val: number) => {
    const boundedValue = Math.max(min, Math.min(max, val));
    onChange({ ...config, kThreshold: boundedValue });
  };

  return (
    <div className="space-y-4 mt-5 pt-5 border-t">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">K-Anonymity Threshold (k)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={config.kThreshold}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || min)}
            min={min}
            max={max}
            className="w-24 h-9 text-center"
          />
          <span className="text-xs text-muted-foreground">records</span>
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[config.kThreshold]}
          onValueChange={([val]) => handleValueChange(val)}
          min={min}
          max={max}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Minimum records with same quasi-identifier values
      </p>
    </div>
  );
}