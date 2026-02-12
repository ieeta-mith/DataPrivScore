import { Info, Lock, Shuffle, EyeOff, Hash, Sparkles } from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

interface HelpDialogTechniquesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialogTechniques({ open, onOpenChange }: HelpDialogTechniquesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <HelpDialogHeader
          icon={<Lock className="h-5 w-5 text-primary" />}
          title="Privacy-Preserving Techniques"
          description="Methods used to protect data while maintaining utility"
        />

        <div className="space-y-6 py-4">
          {/* Overview */}
          <InformationSection
            icon={<Info className="h-4 w-4 text-blue-500" />}
            title="Why Privacy Techniques Matter?"
            description="Privacy-preserving techniques modify data to prevent identification while keeping it useful for analysis. The Privacy Index detects which techniques have been applied to your dataset."
            colorVariant="muted"
          />

          {/* Techniques Grid */}
          <div className="space-y-4">
            <h4 className="font-semibold">Common Techniques</h4>
            
            {/* Generalization */}
            <TechniqueCard
              icon={<Shuffle className="h-5 w-5 text-blue-500" />}
              title="Generalization"
              description="Replacing specific values with broader, less precise categories"
              benefit="high"
              examples={[
                { before: "Age: 29", after: "Age: 25-30" },
                { before: "ZIP: 10001", after: "ZIP: 100**" },
                { before: "Job: Cardiologist", after: "Job: Doctor" },
              ]}
              visualBefore={
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center">29</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center">31</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center">27</div>
                </div>
              }
              visualAfter={
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center">25-35</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center">25-35</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center">25-35</div>
                </div>
              }
            />

            {/* Suppression */}
            <TechniqueCard
              icon={<EyeOff className="h-5 w-5 text-purple-500" />}
              title="Suppression"
              description="Removing or masking certain values entirely"
              benefit="high"
              examples={[
                { before: "Name: John Smith", after: "Name: *****" },
                { before: "SSN: 123-45-6789", after: "SSN: [REDACTED]" },
                { before: "Rare Disease: Yes", after: "[Record removed]" },
              ]}
              visualBefore={
                <div className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded">
                  <p>John Smith</p>
                  <p>123-45-6789</p>
                  <p>john@email.com</p>
                </div>
              }
              visualAfter={
                <div className="text-xs p-2 bg-green-100 dark:bg-green-950 rounded">
                  <p>*****</p>
                  <p>[REDACTED]</p>
                  <p>****@*****.***</p>
                </div>
              }
            />

            {/* Perturbation */}
            <TechniqueCard
              icon={<Hash className="h-5 w-5 text-orange-500" />}
              title="Perturbation / Noise Addition"
              description="Adding random noise to numerical values while preserving statistical properties"
              benefit="medium"
              examples={[
                { before: "Salary: $75,000", after: "Salary: $73,247" },
                { before: "Age: 42", after: "Age: 44" },
                { before: "Weight: 180 lbs", after: "Weight: 176 lbs" },
              ]}
              visualBefore={
                <div className="flex gap-2 text-xs">
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">$75,000</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">$82,000</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">$68,000</div>
                </div>
              }
              visualAfter={
                <div className="flex gap-2 text-xs">
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">$73,247</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">$84,891</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">$66,412</div>
                </div>
              }
            />

            {/* Synthetic Data */}
            <TechniqueCard
              icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
              title="Synthetic Data Generation"
              description="Creating artificial data that preserves statistical patterns without real individuals"
              benefit="high"
              examples={[
                { before: "Real patient records", after: "AI-generated patient profiles" },
                { before: "Actual transactions", after: "Simulated transactions" },
              ]}
              visualBefore={
                <div className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded">
                  <p className="font-medium mb-1">Real Records:</p>
                  <p>John, 45, Heart Disease</p>
                  <p>Mary, 32, Diabetes</p>
                </div>
              }
              visualAfter={
                <div className="text-xs p-2 bg-green-100 dark:bg-green-950 rounded">
                  <p className="font-medium mb-1">Synthetic Records:</p>
                  <p>Patient_001, 43, Heart Disease</p>
                  <p>Patient_002, 35, Diabetes</p>
                </div>
              }
            />
          </div>

          {/* Detection Note */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
              How Detection Works
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              The Privacy Index analyzes patterns in your data to detect applied techniques:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li>• <strong>Range patterns</strong> suggest generalization (e.g., "20-30" instead of exact ages)</li>
              <li>• <strong>Masked values</strong> indicate suppression (e.g., "*****", "[REDACTED]")</li>
              <li>• <strong>Statistical anomalies</strong> may indicate noise addition</li>
              <li>• <strong>Artificial patterns</strong> can reveal synthetic data generation</li>
            </ul>
          </div>

          {/* Key Points */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Key Points</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Combine techniques</strong> for stronger privacy - generalization + suppression is common</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Balance privacy vs utility</strong> - more aggressive techniques reduce data usefulness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Document your process</strong> - knowing which techniques were applied helps interpret results</span>
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

interface TechniqueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: "high" | "medium" | "low";
  examples: { before: string; after: string }[];
  visualBefore: React.ReactNode;
  visualAfter: React.ReactNode;
}

function TechniqueCard({ 
  icon, 
  title, 
  description, 
  benefit, 
  examples,
  visualBefore,
  visualAfter
}: TechniqueCardProps) {
  const benefitVariant = benefit === "high" ? "safe" : benefit === "medium" ? "quasi" : "outline";

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h5 className="font-semibold">{title}</h5>
          </div>
          <Badge variant={benefitVariant}>{benefit} benefit</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Example */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Before:</p>
          {visualBefore}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">After:</p>
          {visualAfter}
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Examples:</p>
        <div className="space-y-1">
          {examples.map((ex, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground line-through">{ex.before}</span>
              <span>→</span>
              <span className="font-medium">{ex.after}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
