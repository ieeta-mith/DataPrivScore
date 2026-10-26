import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { PluginConfigProps } from '@/types/privacy-plugins';
import type { ReIdentificationRiskConfig } from '../types';

export function RiskInlineConfig({ config, onChange }: PluginConfigProps<ReIdentificationRiskConfig>) {
  return (
    <div className="space-y-4 mt-5 pt-5 border-t">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Target Population Size (N_pop)</Label>
        <Input
          type="number"
          placeholder="e.g., 1000000"
          value={config.populationSize || ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : 1;
            onChange({ ...config, populationSize: val });
          }}
          min={1}
          className="w-full h-9"
        />
        <p className="text-xs text-muted-foreground">
          Allows the system to dynamically compute the sampling fraction. Defaults to a conservative baseline of 1.0 if empty.
        </p>
      </div>
    </div>
  );
}