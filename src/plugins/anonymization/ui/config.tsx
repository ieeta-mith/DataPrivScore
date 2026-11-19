import { motion } from "motion/react";

import { AnimatedButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { Info, Search } from "lucide-react";

import type { PluginConfigProps } from "@/types/privacy-plugins";
import type { TechniqueDetectionConfig, TechniqueKey } from "../types";
import { TECHNIQUE_INFO } from "./constants";


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

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Privacy Techniques to Detect</h2>
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => handleToggleAll(true)}
            disabled={config.enabledTechniques && Object.values(config.enabledTechniques).every(Boolean)}
          >
            Enable All
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => handleToggleAll(false)}
            disabled={config.enabledTechniques && Object.values(config.enabledTechniques).every((v) => !v)}
          >
            Disable All
          </AnimatedButton>
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

export function TechniqueDetectionInlineConfig() {
  return (
    <div className="space-y-4 mt-5 pt-5 border-t border-foreground/20">
      <div className="flex items-center justify-center">
        <span className=" flex items-center gap-2 bg-blue-500/10 p-3 rounded-lg border border-blue-800 text-sm text-blue-800">
          <Info /> Use the <strong>Technique Detection</strong> tab above to declare already applied techniques.
        </span>
      </div>
    </div>
  );
}

