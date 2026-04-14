import type { TechniqueKey } from "@/types/configuration";
import type { PrivacyAnalysisConfig } from "@/types/privacy-analysis";
import { containerVariants, itemVariants, TECHNIQUE_ICONS, TECHNIQUE_INFO } from "@/utils/constants";
import { Info, Search } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface TechniquesSectionProps {
  config: PrivacyAnalysisConfig;
  onToggleTechnique: (key: TechniqueKey, enabled: boolean) => void;
  onToggleAll: (enabled: boolean) => void;
  enabledCount: number;
}

export const TechniquesSection = ({
  config,
  onToggleTechnique,
  onToggleAll,
  enabledCount,
}: TechniquesSectionProps) => {

  const totalTechniques = Object.keys(config.enabledTechniques).length;
  const allEnabled = enabledCount === totalTechniques;
  const noneEnabled = enabledCount === 0;

  return (
    <motion.div variants={containerVariants} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Privacy Techniques to Detect</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(true)}
            disabled={allEnabled}
          >
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(false)}
            disabled={noneEnabled}
          >
            Disable All
          </Button>
        </div>
      </div>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                What are Privacy Techniques?
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Privacy techniques are methods applied to data to protect individual privacy while
                maintaining data utility. Select which techniques you want to detect in your
                dataset.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(TECHNIQUE_INFO) as TechniqueKey[]).map((techKey) => {
          const info = TECHNIQUE_INFO[techKey];
          const isEnabled = config.enabledTechniques[techKey];
          const Icon = TECHNIQUE_ICONS[techKey];

          return (
            <motion.div key={techKey} variants={itemVariants}>
              <Card
                className={`transition-all duration-200 cursor-pointer h-full ${
                  isEnabled
                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                    : 'border-muted bg-muted/30 opacity-70'
                }`}
                onClick={() => onToggleTechnique(techKey, !isEnabled)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ scale: isEnabled ? 1 : 0.9 }}
                        className={`p-2 rounded-lg ${
                          isEnabled ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isEnabled ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </motion.div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{info.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => onToggleTechnique(techKey, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}