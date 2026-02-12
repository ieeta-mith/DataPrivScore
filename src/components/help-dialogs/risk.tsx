import { useState } from "react";
import { Info, Target, User, Newspaper, TrendingUp, AlertTriangle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter
} from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

interface HelpDialogRiskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialogRisk({ open, onOpenChange }: HelpDialogRiskProps) {
  const [selectedAttacker, setSelectedAttacker] = useState<"prosecutor" | "journalist" | "marketer">("prosecutor");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <HelpDialogHeader
          title="Understanding Re-identification Risk"
          description="Measuring the probability of identifying individuals"
          icon={<Target className="h-5 w-5 text-primary" />}
        />

        <div className="space-y-6 py-4">
          <InformationSection
            icon={<Info className="h-4 w-4 text-blue-500" />}
            title="What is Re-identification Risk?"
            description="Re-identification risk measures the probability that an attacker can uniquely identify an individual in an anonymized dataset. Different attacker models assume different levels of background knowledge and intent."
            colorVariant="muted"
          />
          {/* Attacker Model Selector */}
          <div className="space-y-4">
            <h4 className="font-semibold">Attacker Models</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedAttacker("prosecutor")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedAttacker === "prosecutor"
                    ? "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <User className={`h-5 w-5 mb-1 ${selectedAttacker === "prosecutor" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} />
                <p className={`font-medium text-sm ${selectedAttacker === "prosecutor" ? "text-red-700 dark:text-red-300" : ""}`}>
                  Prosecutor
                </p>
                <p className="text-xs text-muted-foreground">Targets specific person</p>
              </button>
              <button
                onClick={() => setSelectedAttacker("journalist")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedAttacker === "journalist"
                    ? "bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-700"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <Newspaper className={`h-5 w-5 mb-1 ${selectedAttacker === "journalist" ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`} />
                <p className={`font-medium text-sm ${selectedAttacker === "journalist" ? "text-orange-700 dark:text-orange-300" : ""}`}>
                  Journalist
                </p>
                <p className="text-xs text-muted-foreground">Finds any story</p>
              </button>
              <button
                onClick={() => setSelectedAttacker("marketer")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedAttacker === "marketer"
                    ? "bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <TrendingUp className={`h-5 w-5 mb-1 ${selectedAttacker === "marketer" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
                <p className={`font-medium text-sm ${selectedAttacker === "marketer" ? "text-blue-700 dark:text-blue-300" : ""}`}>
                  Marketer
                </p>
                <p className="text-xs text-muted-foreground">Links databases</p>
              </button>
            </div>
          </div>

          {/* Attacker Details */}
          <div className={`p-4 rounded-lg border ${
            selectedAttacker === "prosecutor" 
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : selectedAttacker === "journalist"
                ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
          }`}>
            {selectedAttacker === "prosecutor" && <ProsecutorModel />}
            {selectedAttacker === "journalist" && <JournalistModel />}
            {selectedAttacker === "marketer" && <MarketerModel />}
          </div>

          {/* Visual Example */}
          <div className="space-y-4">
            <h4 className="font-semibold">Visual Example: Risk Calculation</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Equivalence Class</th>
                    <th className="px-4 py-2 text-left font-medium">Size</th>
                    <th className="px-4 py-2 text-left font-medium">Re-id Probability</th>
                    <th className="px-4 py-2 text-left font-medium">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                    <td className="px-4 py-2">Age: 25, ZIP: 10001, M</td>
                    <td className="px-4 py-2">1</td>
                    <td className="px-4 py-2 font-mono">1/1 = 100%</td>
                    <td className="px-4 py-2"><Badge variant="sensitive">Critical</Badge></td>
                  </tr>
                  <tr className="border-t bg-orange-50/50 dark:bg-orange-950/20">
                    <td className="px-4 py-2">Age: 30-35, ZIP: 100**, F</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2 font-mono">1/3 = 33%</td>
                    <td className="px-4 py-2"><Badge variant="quasi">High</Badge></td>
                  </tr>
                  <tr className="border-t bg-yellow-50/50 dark:bg-yellow-950/20">
                    <td className="px-4 py-2">Age: 40-50, ZIP: 200**, M</td>
                    <td className="px-4 py-2">8</td>
                    <td className="px-4 py-2 font-mono">1/8 = 12.5%</td>
                    <td className="px-4 py-2"><Badge variant="secondary">Medium</Badge></td>
                  </tr>
                  <tr className="border-t bg-green-50/50 dark:bg-green-950/20">
                    <td className="px-4 py-2">Age: 20-30, ZIP: 300**, F</td>
                    <td className="px-4 py-2">25</td>
                    <td className="px-4 py-2 font-mono">1/25 = 4%</td>
                    <td className="px-4 py-2"><Badge variant="safe">Low</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Prosecutor risk</strong> is calculated as the maximum probability across all classes (100% in this example).
              <strong> Overall risk</strong> considers the weighted average based on class sizes.
            </p>
          </div>

          {/* Risk Thresholds */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Risk Thresholds</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-700">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">&lt; 5%</p>
                <p className="text-xs text-green-600 dark:text-green-400">Minimal Risk</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-700">
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">5-20%</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Low Risk</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-950 border border-orange-300 dark:border-orange-700">
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">20-50%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Medium Risk</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700">
                <p className="text-lg font-bold text-red-700 dark:text-red-300">&gt; 50%</p>
                <p className="text-xs text-red-600 dark:text-red-400">High/Critical</p>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Key Points</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Small equivalence classes</strong> are the main source of risk - they make individuals easier to identify</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Outliers</strong> (unusual combinations of attributes) often create singleton classes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Mitigations:</strong> Generalization, suppression, or removal of high-risk records</span>
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

function ProsecutorModel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-red-600 dark:text-red-400" />
        <h5 className="font-semibold text-red-700 dark:text-red-300">Prosecutor Attack Model</h5>
      </div>
      <p className="text-sm text-red-600 dark:text-red-400">
        The attacker <strong>knows their target is in the dataset</strong> and wants to find their record.
      </p>
      <div className="p-3 rounded bg-white/50 dark:bg-black/20">
        <p className="text-sm font-medium mb-2">Scenario:</p>
        <p className="text-sm text-muted-foreground">
          "I know my neighbor John (age 45, from ZIP 10001) participated in this health study. 
          I want to find out if he has any diseases."
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="text-red-600 dark:text-red-400">
          Risk = 1 / (size of smallest equivalence class containing target)
        </span>
      </div>
    </div>
  );
}

function JournalistModel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        <h5 className="font-semibold text-orange-700 dark:text-orange-300">Journalist Attack Model</h5>
      </div>
      <p className="text-sm text-orange-600 dark:text-orange-400">
        The attacker <strong>doesn't know if a specific person is in the dataset</strong>, but wants to find anyone they can identify.
      </p>
      <div className="p-3 rounded bg-white/50 dark:bg-black/20">
        <p className="text-sm font-medium mb-2">Scenario:</p>
        <p className="text-sm text-muted-foreground">
          "I have access to voter registration data. Let me see if I can match any records 
          in this health dataset to create a news story about a public figure."
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <span className="text-orange-600 dark:text-orange-400">
          Risk = Number of unique records / Total records
        </span>
      </div>
    </div>
  );
}

function MarketerModel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h5 className="font-semibold text-blue-700 dark:text-blue-300">Marketer Attack Model</h5>
      </div>
      <p className="text-sm text-blue-600 dark:text-blue-400">
        The attacker wants to <strong>link records across multiple databases</strong> to build profiles.
      </p>
      <div className="p-3 rounded bg-white/50 dark:bg-black/20">
        <p className="text-sm font-medium mb-2">Scenario:</p>
        <p className="text-sm text-muted-foreground">
          "I have a customer database. If I can link it to this health dataset, I can target 
          ads for health products to people with specific conditions."
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-blue-500" />
        <span className="text-blue-600 dark:text-blue-400">
          Risk = Average probability of successful linkage across all records
        </span>
      </div>
    </div>
  );
}
