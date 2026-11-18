import { Info, BookOpen } from "lucide-react";
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