import { useState } from "react";
import { Info, CheckCircle2, XCircle, Activity } from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

interface HelpDialogTClosenessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialogTCloseness({ open, onOpenChange }: HelpDialogTClosenessProps) {
  const [showFixed, setShowFixed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <HelpDialogHeader
          icon={<Activity className="h-5 w-5 text-primary" />}
          title="Understanding T-Closeness"
          description="Protecting against skewness and similarity attacks"
        />
        <div className="space-y-6 py-4">
          {/* Definition */}
          <InformationSection
            icon={<Info className="h-4 w-4 text-blue-500" />}
            title="What is T-Closeness?"
            description={
              <>
                T-closeness ensures that the distribution of sensitive attribute values within any equivalence class is <strong>close to</strong> the overall distribution in the entire dataset. The "distance" between distributions must be no more than <strong>t</strong>.
              </>
            }
            colorVariant="muted"
          />
          <InformationSection
            title="Why L-Diversity Isn't Enough"
            description={
              <>
                L-diversity can still leak information through <strong>skewness attacks</strong> (when the distribution in a group differs significantly from the overall population) and <strong> similarity attacks</strong> (when diverse values are semantically similar).
              </>
            }
            colorVariant="warning"
          />
          {/* Interactive Example */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Visual Example: Disease Distribution</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <button
                  onClick={() => setShowFixed(false)}
                  className={`px-3 py-1 text-sm rounded-l-md border transition-colors ${
                    !showFixed 
                      ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300" 
                      : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  Skewed (High t)
                </button>
                <button
                  onClick={() => setShowFixed(true)}
                  className={`px-3 py-1 text-sm rounded-r-md border-y border-r transition-colors ${
                    showFixed 
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300" 
                      : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  Balanced (Low t)
                </button>
              </div>
            </div>

            {/* Distribution Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Overall Distribution */}
              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-3 text-center">Overall Dataset Distribution</h5>
                <div className="space-y-2">
                  <DistributionBar label="Cancer" percentage={20} color="red" />
                  <DistributionBar label="Heart Disease" percentage={40} color="orange" />
                  <DistributionBar label="Flu" percentage={40} color="blue" />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  This is what an attacker expects based on public health statistics
                </p>
              </div>

              {/* Group Distribution */}
              <div className={`border rounded-lg p-4 ${
                !showFixed 
                  ? "border-red-200 dark:border-red-800" 
                  : "border-green-200 dark:border-green-800"
              }`}>
                <h5 className="font-medium mb-3 text-center">
                  Group A Distribution
                  <Badge className="ml-2" variant={showFixed ? "safe" : "sensitive"}>
                    {showFixed ? "t ≈ 0.1" : "t ≈ 0.6"}
                  </Badge>
                </h5>
                <div className="space-y-2">
                  {!showFixed ? (
                    <>
                      <DistributionBar label="Cancer" percentage={80} color="red" highlight />
                      <DistributionBar label="Heart Disease" percentage={10} color="orange" />
                      <DistributionBar label="Flu" percentage={10} color="blue" />
                    </>
                  ) : (
                    <>
                      <DistributionBar label="Cancer" percentage={25} color="red" />
                      <DistributionBar label="Heart Disease" percentage={35} color="orange" />
                      <DistributionBar label="Flu" percentage={40} color="blue" />
                    </>
                  )}
                </div>
                <p className={`text-xs mt-3 text-center ${
                  showFixed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {showFixed 
                    ? "Distribution is close to overall - low information gain" 
                    : "80% Cancer is much higher than expected 20%!"}
                </p>
              </div>
            </div>
            <InformationSection
              icon={!showFixed ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
              title={!showFixed ? "Skewness Attack Possible" : "T-Closeness Satisfied (t ≈ 0.1)"}
              description={
                !showFixed 
                  ? "Even though Group A has 3 different diseases (satisfies 3-diversity), the distribution is heavily skewed toward Cancer (80% vs 20% overall). An attacker knowing someone is in Group A learns they're <strong>4x more likely</strong> to have Cancer than average!"
                  : "The distribution in Group A closely matches the overall distribution. An attacker gains minimal additional information by knowing someone belongs to this group."
              }
              colorVariant={showFixed ? "sucess" : "error"}
            />
          </div>

          {/* Key Points */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Key Points</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>t value range: 0 to 1</strong> - Lower t means stricter privacy (distributions must be more similar)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>t = 0</strong> means perfect match with overall distribution (strongest privacy, but may destroy data utility)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Recommended: t ≤ 0.2</strong> for most applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Strongest model:</strong> T-closeness is generally considered the strongest of the three privacy models</span>
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

// Helper component for distribution bars
function DistributionBar({ 
  label, 
  percentage, 
  color, 
  highlight = false 
}: { 
  label: string; 
  percentage: number; 
  color: "red" | "orange" | "blue";
  highlight?: boolean;
}) {
  const colorClasses = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-24 truncate">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} ${highlight ? "animate-pulse" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs w-10 text-right ${highlight ? "font-bold text-red-600 dark:text-red-400" : ""}`}>
        {percentage}%
      </span>
    </div>
  );
}
