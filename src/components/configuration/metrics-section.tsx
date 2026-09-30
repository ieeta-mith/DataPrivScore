/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, HelpCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { containerVariants, itemVariants } from "@/utils/constants";

import type { PluginUIExtension } from "@/types/privacy-plugins";

interface MetricsSectionProps {
  uiExtensions: PluginUIExtension[];
  enabledPlugins: Record<string, boolean>;
  pluginConfigs: Record<string, any>;
  onTogglePlugin: (pluginId: string, enabled: boolean) => void;
  onConfigChange: (pluginId: string, config: any) => void;
}

export const MetricsSection = ({
  uiExtensions,
  enabledPlugins,
  pluginConfigs,
  onTogglePlugin,
  onConfigChange,
}: MetricsSectionProps) => {

  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  return (
    <motion.div variants={containerVariants} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Select Metrics to Evaluate</h2>
      </div>

      {uiExtensions.map((ui) => {
        if (!ui.InlineConfig && ui.ConfigTab) return null;

        const isEnabled = enabledPlugins[ui.id] || false;
        const Icon = ui.icon;
        const InlineConfig = ui.InlineConfig;
        const HelpDialog = ui.HelpComponent;

        return (
          <motion.div key={ui.id} variants={itemVariants}>
            <Card
              className={`transition-all duration-200 ${
                isEnabled ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-muted bg-muted/30 opacity-70'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ scale: isEnabled ? 1 : 0.9 }}
                      className={`p-3 rounded-xl ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}
                    >
                      <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </motion.div>
                    <div className="flex items-center gap-2 h-11">
                      <span className="font-semibold text-base">{ui.title}</span>
                      {/* Render Help Button inline next to the title */}
                      {HelpDialog && (
                        <button 
                          onClick={() => setActiveHelp(ui.id)}
                          className="p-1 rounded-full hover:bg-muted transition-colors"
                          title={`Learn about ${ui.title}`}
                        >
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => onTogglePlugin(ui.id, checked)}
                  />
                </div>

                <AnimatePresence>
                  {isEnabled && InlineConfig && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <InlineConfig
                        config={pluginConfigs[ui.id]}
                        onChange={(newConfig) => onConfigChange(ui.id, newConfig)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            {HelpDialog && (
              <HelpDialog 
                open={activeHelp === ui.id} 
                onOpenChange={(open) => !open && setActiveHelp(null)} 
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};