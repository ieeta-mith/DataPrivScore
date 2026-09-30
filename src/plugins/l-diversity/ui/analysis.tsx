import { useState } from "react";
import { AlertTriangle, PieChart, Info, XCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { StatCard, StatGrid, InfoCard, WarningCard } from "@/components/ui/stat-card";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";
import SwitchExample from "@/components/switch-example";

import type { PluginDetailsProps, PluginHelpProps } from "@/types/privacy-plugins";
import type { LDiversityResult } from "../types";

export function LDiversityDetails({ data: l }: PluginDetailsProps<LDiversityResult>) {
  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard label="L-Value Achieved" value={l.lValue.toString()} />
        <StatCard label="L-Threshold" value={l.lThreshold.toString()} />
        <StatCard label="Diversity Type" value={l.diversityType} className="capitalize" />
        <StatCard label="Average Entropy" value={l.averageEntropy.toFixed(3)} />
      </StatGrid>
      
      <InfoCard title="Sensitive Attributes Analyzed">
        <div className="flex flex-wrap gap-2">
          {l.sensitiveAttributes.length > 0 ? (
            l.sensitiveAttributes.map((sa) => (
              <Badge key={sa} variant="sensitive">{sa}</Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No sensitive attributes found</span>
          )}
        </div>
      </InfoCard>

      {l.violatingClasses.length > 0 && (
        <WarningCard
          title="Violating Classes"
          count={l.violatingClasses.length}
          description="These equivalence classes have insufficient diversity in sensitive attribute values, making them vulnerable to attribute disclosure."
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      )}
    </div>
  );
}

export function LDiversityHelp({ open, onOpenChange }: PluginHelpProps) {
  const [showDiverse, setShowDiverse] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <HelpDialogHeader
          icon={<PieChart className="h-5 w-5 text-primary" />}
          title="Understanding L-Diversity"
          description="Protecting sensitive attributes within anonymous groups"
        />
        
        <div className="space-y-6 py-4">
          <InformationSection
            icon={<Info className="h-4 w-4 text-blue-500" />}
            title="What is L-Diversity?"
            description="While K-Anonymity hides individuals in a crowd, L-Diversity ensures that the crowd doesn't all share the same sensitive secret. It requires that every group (equivalence class) contains at least 'l' well-represented distinct values for its sensitive attributes."
            colorVariant="muted"
          />

          <div className="space-y-4">
            <SwitchExample
              showAnonymized={showDiverse}
              setShowAnonymized={setShowDiverse}
              option1="Not Diverse (l=1)"
              option2="Diverse (l=3)"
            />
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Age (Quasi)</th>
                    <th className="px-4 py-2 text-left font-medium">ZIP (Quasi)</th>
                    <th className="px-4 py-2 text-left font-medium">
                      <Badge variant="sensitive" className="text-xs">Sensitive</Badge>
                      {" "}Medical Condition
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {!showDiverse ? (
                    <>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2 font-medium">30-40</td>
                        <td className="px-4 py-2 font-medium">100**</td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400 font-medium">Cancer</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group A (k=3)</Badge></td>
                      </tr>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2 font-medium">30-40</td>
                        <td className="px-4 py-2 font-medium">100**</td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400 font-medium">Cancer</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group A (k=3)</Badge></td>
                      </tr>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2 font-medium">30-40</td>
                        <td className="px-4 py-2 font-medium">100**</td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400 font-medium">Cancer</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group A (k=3)</Badge></td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2 font-medium">30-40</td>
                        <td className="px-4 py-2 font-medium">100**</td>
                        <td className="px-4 py-2">Cancer</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A (k=3)</Badge></td>
                      </tr>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2 font-medium">30-40</td>
                        <td className="px-4 py-2 font-medium">100**</td>
                        <td className="px-4 py-2">Heart Disease</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A (k=3)</Badge></td>
                      </tr>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2 font-medium">30-40</td>
                        <td className="px-4 py-2 font-medium">100**</td>
                        <td className="px-4 py-2">Viral Infection</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A (k=3)</Badge></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            <InformationSection
              icon={!showDiverse ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
              title={!showDiverse ? "Homogeneity Attack (k=3, l=1)" : "Protected (k=3, l=3)"}
              description={
                !showDiverse 
                  ? "Even though the group satisfies k=3 anonymity, an attacker who knows their target is a 35-year-old from ZIP 10045 will easily deduce they have Cancer, because everyone in that group has Cancer."
                  : "By ensuring L-Diversity (l=3 distinct diseases), the attacker only has a 1-in-3 chance of guessing the target's medical condition, protecting against attribute disclosure."
              }
              colorVariant={showDiverse ? "sucess" : "error"}
            /> 
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Key Points & Diversity Types</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Distinct:</strong> Requires at least <em>l</em> completely unique sensitive values in a group. Simple, but vulnerable if one value dominates the group (e.g., 98% Flu, 1% Cancer, 1% HIV).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Entropy:</strong> Evaluates the information distribution. A group is secure only if its sensitive values are spread out relatively evenly, measured via Shannon entropy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Recursive (c, l):</strong> The strictest measure. Ensures the most frequent sensitive value does not disproportionately dominate the rest of the values in the equivalence class.</span>
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