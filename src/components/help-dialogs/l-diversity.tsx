import { useState } from "react";
import { Info, CheckCircle2, XCircle, PieChart } from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

interface HelpDialogLDiversityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialogLDiversity({ open, onOpenChange }: HelpDialogLDiversityProps) {
  const [showDiverse, setShowDiverse] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <HelpDialogHeader
          icon={<PieChart className="h-5 w-5 text-primary" />}
          title="Understanding L-Diversity"
          description="Protecting against attribute disclosure through diversity"
        />

        <div className="space-y-6 py-4">
          {/* Definition */}
          <InformationSection
            icon={<Info className="h-5 w-5 text-blue-500" />}
            title="What is L-Diversity?"
            description={
              <>
                L-diversity extends k-anonymity by ensuring that each equivalence class (group of indistinguishable records) has at least <strong>l different "well-represented" values</strong> for sensitive attributes. This protects against the <em>homogeneity attack</em>.
              </>
            }
            colorVariant="muted"
          />
          <InformationSection
            title="Why K-Anonymity Isn't Enough"
            description={
              <>
                Even with k-anonymity, if everyone in a group has the <em>same</em> sensitive value, an attacker can still learn that value with certainty. This is called the <strong> homogeneity attack</strong>.
              </>
            }
            colorVariant="warning"
          />

          {/* Interactive Example */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Visual Example</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <button
                  onClick={() => setShowDiverse(false)}
                  className={`px-3 py-1 text-sm rounded-l-md border transition-colors ${
                    !showDiverse 
                      ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300" 
                      : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  k=2, l=1 (Vulnerable)
                </button>
                <button
                  onClick={() => setShowDiverse(true)}
                  className={`px-3 py-1 text-sm rounded-r-md border-y border-r transition-colors ${
                    showDiverse 
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300" 
                      : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  k=2, l=2 (Protected)
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Age</th>
                    <th className="px-4 py-2 text-left font-medium">ZIP</th>
                    <th className="px-4 py-2 text-left font-medium">
                      <Badge variant="sensitive" className="text-xs">Sensitive</Badge>
                      {" "}Salary
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Group</th>
                    <th className="px-4 py-2 text-left font-medium">Diversity</th>
                  </tr>
                </thead>
                <tbody>
                  {!showDiverse ? (
                    // Homogeneous groups - l=1
                    <>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2">20-30</td>
                        <td className="px-4 py-2">1305*</td>
                        <td className="px-4 py-2 font-medium text-red-600 dark:text-red-400">$50,000</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group A</Badge></td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400">l=1 ⚠️</td>
                      </tr>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2">20-30</td>
                        <td className="px-4 py-2">1305*</td>
                        <td className="px-4 py-2 font-medium text-red-600 dark:text-red-400">$50,000</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group A</Badge></td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400">l=1 ⚠️</td>
                      </tr>
                      <tr className="border-t bg-orange-50/50 dark:bg-orange-950/20">
                        <td className="px-4 py-2">30-40</td>
                        <td className="px-4 py-2">1306*</td>
                        <td className="px-4 py-2 font-medium text-orange-600 dark:text-orange-400">$80,000</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group B</Badge></td>
                        <td className="px-4 py-2 text-orange-600 dark:text-orange-400">l=1 ⚠️</td>
                      </tr>
                      <tr className="border-t bg-orange-50/50 dark:bg-orange-950/20">
                        <td className="px-4 py-2">30-40</td>
                        <td className="px-4 py-2">1306*</td>
                        <td className="px-4 py-2 font-medium text-orange-600 dark:text-orange-400">$80,000</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Group B</Badge></td>
                        <td className="px-4 py-2 text-orange-600 dark:text-orange-400">l=1 ⚠️</td>
                      </tr>
                    </>
                  ) : (
                    // Diverse groups - l=2
                    <>
                      <tr className="border-t bg-green-50/50 dark:bg-green-950/20">
                        <td className="px-4 py-2">20-30</td>
                        <td className="px-4 py-2">1305*</td>
                        <td className="px-4 py-2">$50,000</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A</Badge></td>
                        <td className="px-4 py-2 text-green-600 dark:text-green-400">l=2 ✓</td>
                      </tr>
                      <tr className="border-t bg-green-50/50 dark:bg-green-950/20">
                        <td className="px-4 py-2">20-30</td>
                        <td className="px-4 py-2">1305*</td>
                        <td className="px-4 py-2">$70,000</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A</Badge></td>
                        <td className="px-4 py-2 text-green-600 dark:text-green-400">l=2 ✓</td>
                      </tr>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2">30-40</td>
                        <td className="px-4 py-2">1306*</td>
                        <td className="px-4 py-2">$80,000</td>
                        <td className="px-4 py-2"><Badge variant="quasi" className="text-xs">Group B</Badge></td>
                        <td className="px-4 py-2 text-blue-600 dark:text-blue-400">l=2 ✓</td>
                      </tr>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2">30-40</td>
                        <td className="px-4 py-2">1306*</td>
                        <td className="px-4 py-2">$95,000</td>
                        <td className="px-4 py-2"><Badge variant="quasi" className="text-xs">Group B</Badge></td>
                        <td className="px-4 py-2 text-blue-600 dark:text-blue-400">l=2 ✓</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <InformationSection
              icon={!showDiverse ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
              title={!showDiverse ? "Homogeneity Attack Possible" : "2-Diversity Achieved"}
              description={
                !showDiverse 
                  ? "Even though this data satisfies 2-anonymity, all people in Group A earn $50,000 and all in Group B earn $80,000. An attacker knowing someone is in their 20s from ZIP 1305* can determine their exact salary!"
                  : "By generalizing ages to ranges and ZIP codes to prefixes, each group now contains at least 2 records. An attacker knowing someone is a male in their 20s from ZIP 1305* cannot distinguish between 2 people."
              }
              colorVariant={showDiverse ? "sucess" : "error"}
            />
          </div>
          {/* Key Points */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Key Points</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Builds on k-anonymity</strong> - L-diversity requires k-anonymity as a foundation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Protects sensitive values</strong> - Even if you're identified in a group, your specific sensitive attribute remains uncertain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Limitation:</strong> Doesn't account for the semantic closeness of values (e.g., $50k and $51k are "diverse" but similar)</span>
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
