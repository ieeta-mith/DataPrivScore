import { AlertTriangle, Activity, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { StatCard, StatGrid, InfoCard, WarningCard } from "@/components/ui/stat-card";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

import type { PluginDetailsProps, PluginHelpProps } from "@/types/privacy-plugins";
import type { TClosenessResult } from "../types";

export function TClosenessDetails({ data: t }: PluginDetailsProps<TClosenessResult>) {
  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard label="Max Distance" value={t.maxDistance.toFixed(4)} />
        <StatCard label="T-Threshold" value={t.tThreshold.toString()} />
        <StatCard label="Average Distance" value={t.averageDistance.toFixed(4)} />
        <StatCard label="Compliance Rate" value={`${t.complianceRate.toFixed(1)}%`} />
      </StatGrid>
      
      <InfoCard title="Sensitive Attribute Analyzed">
        {t.sensitiveAttribute ? (
          <Badge variant="sensitive">{t.sensitiveAttribute}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No sensitive attribute analyzed</span>
        )}
      </InfoCard>

      {t.violatingClasses.length > 0 && (
        <WarningCard
          title="Violating Classes"
          count={t.violatingClasses.length}
          description={`These equivalence classes have a distributional skew exceeding the threshold of ${t.tThreshold}.`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      )}
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