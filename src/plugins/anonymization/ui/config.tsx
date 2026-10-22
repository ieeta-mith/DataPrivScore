import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { 
  Layers, EyeOff, Eye, Hash, UserX,
  Waves, Archive 
} from "lucide-react";

import type { PluginConfigProps } from "@/types/privacy-plugins";
import type { TechniqueDetectionConfig, TechniqueKey } from "../types";
import type { LucideIcon } from "lucide-react";

const TECHNIQUE_INFO: Record<TechniqueKey, { name: string; description: string; icon: LucideIcon }> = {
  generalization: { name: 'Generalization', description: 'Replaces specific values with broader categories', icon: Layers },
  suppression: { name: 'Suppression', description: 'Removes or replaces sensitive values with placeholders', icon: EyeOff },
  masking: { name: 'Masking', description: 'Partially hides values while preserving some info', icon: Eye },
  hashing: { name: 'Hashing', description: 'Transforms values into fixed-length cryptographic hashes', icon: Hash },
  pseudonymization: { name: 'Pseudonymization', description: 'Replaces identifiers with artificial pseudonyms', icon: UserX },
  noiseAddition: { name: 'Noise Addition', description: 'Adds random statistical noise to numerical values', icon: Waves },
  bucketing: { name: 'Bucketing', description: 'Groups continuous values into discrete bins', icon: Archive },
};

export function TechniqueDetectionConfigTab({ config, onChange }: PluginConfigProps<TechniqueDetectionConfig>) {

  const handleToggleTechnique = (key: TechniqueKey, enabled: boolean) => {
    onChange({ ...config, enabledTechniques: { ...config.enabledTechniques, [key]: enabled } });
  };

  const handleToggleAll = (enabled: boolean) => {
    const newTechniques = { ...config.enabledTechniques };
    (Object.keys(newTechniques) as TechniqueKey[]).forEach(k => newTechniques[k] = enabled);
    onChange({ ...config, enabledTechniques: newTechniques });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
          Declare Applied Techniques
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Select the anonymization techniques you have already applied to your dataset. 
          If none are selected, the system will scan for all detectable techniques automatically.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium whitespace-nowrap">Verification Strictness (Min. Confidence)</Label>
          <Input
            type="number"
            value={config.minConfidence}
            onChange={(e) => onChange({ ...config, minConfidence: Math.max(0.1, Math.min(1.0, parseFloat(e.target.value) || 0.3)) })}
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-20 h-8 text-center"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleToggleAll(true)}>Declare All</Button>
          <Button variant="outline" size="sm" onClick={() => handleToggleAll(false)}>Clear All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(TECHNIQUE_INFO) as TechniqueKey[]).map((techKey) => {
          const info = TECHNIQUE_INFO[techKey];
          const isEnabled = config.enabledTechniques[techKey] ?? false;
          const Icon = info.icon;

          return (
            <motion.div key={techKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={`transition-all duration-200 cursor-pointer h-full ${
                  isEnabled ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-muted bg-muted/30 opacity-70'
                }`}
                onClick={() => handleToggleTechnique(techKey, !isEnabled)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <motion.div animate={{ scale: isEnabled ? 1 : 0.9 }} className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </motion.div>
                      <div className="space-y-1">
                        <span className="font-medium text-sm">{info.name}</span>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={(checked) => handleToggleTechnique(techKey, checked)} onClick={(e) => e.stopPropagation()} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function TechniqueDetectionInlineConfig({ config, onChange }: PluginConfigProps<TechniqueDetectionConfig>) {
  return (
    <div className="space-y-4 mt-5 pt-5 border-t">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Generate Recommendations</Label>
          <p className="text-xs text-muted-foreground">Suggest additional privacy techniques for unprotected attributes</p>
        </div>
        <Switch
          checked={config.generateRecommendations}
          onCheckedChange={(checked) => onChange({ ...config, generateRecommendations: checked })}
        />
      </div>
      
      <div className="p-3 bg-muted/50 rounded-lg border border-dashed text-sm text-muted-foreground flex items-center justify-center">
        <span>Use the <strong>Technique Detection</strong> tab above to declare previously applied techniques.</span>
      </div>
    </div>
  );
}

