import { Info, BookOpen, ExternalLink } from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { AnimatedButton, Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

interface HelpDialogResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialogResults({ open, onOpenChange }: HelpDialogResultsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <HelpDialogHeader
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          title="Privacy Analysis Guide"
          description="Understanding privacy metrics and their importance"
        />

        <div className="space-y-6 py-4">
          <InformationSection
            icon={<Info className="h-5 w-5 text-green-600" />}
            title="Understanding Your Privacy Score"
            description="The Privacy Index is a comprehensive score (0-100) that evaluates how well your dataset protects individual privacy. It combines multiple privacy metrics including k-anonymity, l-diversity, t-closeness, and re-identification risk analysis. A higher score indicates better privacy protection."
            colorVariant="muted"
          />

          {/* Grade Explanation */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Privacy Grades</h4>
            <div className="grid grid-cols-5 gap-2">
              <GradeBadge grade="A" range="90-100" description="Excellent protection" color="emerald" />
              <GradeBadge grade="B" range="75-89" description="Good protection" color="green" />
              <GradeBadge grade="C" range="60-74" description="Moderate protection" color="yellow" />
              <GradeBadge grade="D" range="40-59" description="Poor protection" color="orange" />
              <GradeBadge grade="F" range="0-39" description="Critical risk" color="red" />
            </div>
          </div>

          {/* Privacy Metrics Overview */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Privacy Metrics</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Click the <span className="inline-flex items-center"><HelpCircle className="h-4 w-4 mx-1" /></span> 
              button next to each section for detailed explanations with visual examples.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MetricOverviewCard 
                title="K-Anonymity" 
                description="Ensures each record is indistinguishable from k-1 others"
              />
              <MetricOverviewCard 
                title="L-Diversity" 
                description="Ensures diversity of sensitive values within groups"
              />
              <MetricOverviewCard 
                title="T-Closeness" 
                description="Ensures distribution similarity to overall dataset"
              />
              <MetricOverviewCard 
                title="Re-identification Risk" 
                description="Measures probability of identifying individuals"
              />
            </div>
          </div>

          {/* Best Practices */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Best Practices for Privacy Protection</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Remove or encrypt direct identifiers (names, SSN, emails) before sharing data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Apply generalization to quasi-identifiers (age ranges instead of exact ages).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Ensure sufficient diversity in sensitive attribute values within each group.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Target k ≥ 5 for most use cases, higher for sensitive data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                <span>Regularly re-assess privacy as new data or external datasets become available.</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <ExternalLink className="h-4 w-4" />
              Learn More
            </h4>
            <div className="space-y-1 text-sm">
              <p className="text-blue-600 dark:text-blue-400">
                • Sweeney, L. (2002). "k-Anonymity: A Model for Protecting Privacy"
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                • Machanavajjhala, A. et al. (2007). "l-Diversity: Privacy Beyond k-Anonymity"
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                • Li, N. et al. (2007). "t-Closeness: Privacy Beyond k-Anonymity and l-Diversity"
              </p>
            </div>
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

interface GradeBadgeProps {
  grade: string;
  range: string;
  description: string;
  color: "emerald" | "green" | "yellow" | "orange" | "red";
}

function GradeBadge({ grade, range, description, color }: GradeBadgeProps) {
  const colorStyles = {
    emerald: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    green: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800",
    yellow: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800",
    orange: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800",
    red: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800",
  };

  return (
    <div className={`p-2 rounded-lg border text-center ${colorStyles[color]}`}>
      <div className="text-2xl font-bold">{grade}</div>
      <div className="text-xs font-medium">{range}</div>
      <div className="text-xs opacity-70">{description}</div>
    </div>
  );
}

interface MetricOverviewCardProps {
  title: string;
  description: string;
}

function MetricOverviewCard({ title, description }: MetricOverviewCardProps) {
  return (
    <div className="p-3 rounded-lg bg-background border">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Small help button to trigger help dialog
 */
export function HelpButton({ onClick, className = "" }: HelpButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-6 w-6 ${className}`}
      onClick={onClick}
    >
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
    </Button>
  );
}