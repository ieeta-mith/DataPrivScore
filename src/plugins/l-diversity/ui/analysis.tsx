import { useState } from "react";
import { PieChart, Info, XCircle, CheckCircle2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { StatCard, StatGrid, InfoCard } from "@/components/ui/stat-card";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";
import SwitchExample from "@/components/switch-example";

import type { PluginDetailsProps, PluginHelpProps } from "@/types/privacy-plugins";
import type { LDiversityResult } from "../types";

export function LDiversityDetails({ data: l }: PluginDetailsProps<LDiversityResult>) {
  const detailedViolations = l.classResults.filter(c => !c.satisfiesLDiversity);
  const homogeneousCount = detailedViolations.filter(c => c.distinctCount === 1).length;
  
  const worstViolators = [...detailedViolations]
    .sort((a, b) => a.distinctCount - b.distinctCount || a.entropy - b.entropy)
    .slice(0, 5);

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

      {detailedViolations.length > 0 && (
        <div className="border border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/20 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-200">
                Diversity Vulnerabilities Detected
              </h4>
              <p className="text-sm text-red-800/80 dark:text-red-200/80">
                {detailedViolations.length} group(s) failed the {l.diversityType} l-diversity threshold of {l.lThreshold}.
                {homogeneousCount > 0 && <strong> {homogeneousCount} of these groups have completely homogeneous sensitive values (l=1), making them highly vulnerable to attribute disclosure.</strong>}
              </p>
            </div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-4 border border-red-100 dark:border-red-900/30">
            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Top At-Risk Groups & Distributions</h5>
            <div className="space-y-3">
              {worstViolators.map((ec, index) => (
                <div key={index} className="flex flex-col gap-2 text-sm p-3 bg-background rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground break-all mr-4">{ec.equivalenceClassId}</span>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span>Distinct: <strong className="text-red-600 dark:text-red-400">{ec.distinctCount}</strong></span>
                      <span>Entropy: <strong>{ec.entropy.toFixed(2)}</strong></span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-dashed">
                    {Object.entries(ec.sensitiveValueDistribution).map(([val, count]) => (
                      <Badge key={val} variant="outline" className="text-xs font-normal">
                        {val}: <strong className="ml-1">{count}</strong>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {detailedViolations.length > 5 && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                  + {detailedViolations.length - 5} more violating groups
                </div>
              )}
            </div>
          </div>
        </div>
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