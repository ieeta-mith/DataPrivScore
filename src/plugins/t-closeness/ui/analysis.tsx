import { AlertTriangle, Activity, Info, ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { StatCard, StatGrid, InfoCard } from "@/components/ui/stat-card";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

import type { PluginDetailsProps, PluginHelpProps } from "@/types/privacy-plugins";
import type { TClosenessResult } from "../types";

export function TClosenessDetails({ data: t }: PluginDetailsProps<TClosenessResult>) {
  if (!t.sensitiveAttributes || t.sensitiveAttributes.length === 0) {
    return (
      <InfoCard title="No Sensitive Attributes">
        <span className="text-muted-foreground text-sm">
          T-closeness is not applicable because no sensitive attributes were found in the dataset.
        </span>
      </InfoCard>
    );
  }

  return (
    <div className="space-y-6">
      <StatGrid columns={4}>
        <StatCard label="Global Max Distance" value={t.maxDistance.toFixed(4)} />
        <StatCard label="T-Threshold" value={t.tThreshold.toString()} />
        <StatCard label="Global Avg Distance" value={t.averageDistance.toFixed(4)} />
        <StatCard label="Worst Compliance Rate" value={`${t.complianceRate.toFixed(1)}%`} />
      </StatGrid>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Sensitive Attributes Analyzed</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.sensitiveAttributes.map(attr => {
            const attrData = t.attributeResults[attr];

            let attrStatus: 'satisfied' | 'warning' | 'violated' = 'violated';
            if (attrData.maxDistance <= t.tThreshold) {
              attrStatus = 'satisfied';
            } else if (attrData.averageDistance <= t.tThreshold) {
              attrStatus = 'warning';
            }
            
            const styles = {
              satisfied: {
                border: 'border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20',
                icon: <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />,
                badge: 'safe' as const,
                label: 'Satisfied'
              },
              warning: {
                border: 'border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20',
                icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />,
                badge: 'quasi' as const,
                label: 'Warning'
              },
              violated: {
                border: 'border-red-200 bg-red-50/30 dark:border-red-900 dark:bg-red-950/20',
                icon: <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-500" />,
                badge: 'sensitive' as const,
                label: 'Violated'
              }
            }[attrStatus];
            
            return (
              <div 
                key={attr} 
                className={`p-4 rounded-lg border flex flex-col gap-3 ${styles.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {styles.icon}
                    <span className="font-medium">{attr}</span>
                  </div>
                  <Badge variant={styles.badge}>
                    {styles.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-foreground/10">
                  <div className="flex flex-col">
                    <span>Max Dist</span>
                    <strong className="text-foreground">{attrData.maxDistance.toFixed(3)}</strong>
                  </div>
                  <div className="flex flex-col">
                    <span>Avg Dist</span>
                    <strong className="text-foreground">{attrData.averageDistance.toFixed(3)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TClosenessHelp({ open, onOpenChange }: PluginHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <HelpDialogHeader
          icon={<Activity className="h-5 w-5 text-primary" />}
          title="Understanding T-Closeness"
          description="Protecting against distributional skew inference attacks"
        />
        
        <div className="space-y-6 py-4">
          <InformationSection
            icon={<Info className="h-4 w-4 text-blue-500" />}
            title="What is T-Closeness?"
            description="T-Closeness ensures that the distribution of a sensitive attribute in any given anonymous group (local distribution) is 'close' to the distribution of that attribute in the overall dataset (global distribution). It protects against skew attacks where a group might satisfy L-Diversity, but still leaks information because its values cluster unnaturally."
            colorVariant="muted"
          />

          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">How Distance is Measured</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Earth Mover's Distance (EMD):</strong> The algorithm calculates the minimum "cost" to transform the local distribution so it matches the global distribution.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Categorical Data:</strong> Measured using Total Variation Distance. If a group has 50% Cancer and 50% Flu, but the global dataset is 1% Cancer and 99% Flu, the distance is very high, causing a violation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Numerical Data:</strong> Measured via Cumulative Distribution Functions (CDFs). It checks if numerical values (like Salaries) are clustered significantly higher or lower in a group compared to the whole table.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Multi-Attribute Evaluation:</strong> Every sensitive attribute is evaluated independently. A group will violate T-closeness if <em>any</em> sensitive attribute skews too far from its global baseline.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <AnimatedButton onClick={() => onOpenChange(false)}>
            Got it
          </AnimatedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}