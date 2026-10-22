import { AlertTriangle, Archive, Eye, EyeOff, Hash, Info, Layers, ShieldCheck, UserX, Lock, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid, WarningCard } from "@/components/ui/stat-card";

import type { PluginDetailsProps } from "@/types/privacy-plugins";
import type { TechniqueDetectionResult } from "../types";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";

export function TechniqueDetails({ data: tech }: PluginDetailsProps<TechniqueDetectionResult>) {
	return (
		<div className="space-y-4">
			<StatGrid columns={3}>
				<StatCard label="Verified Techniques" value={tech.detectedTechniques.length.toString()} />
				<StatCard label="Attribute Coverage" value={`${(tech.techniqueCoverage * 100).toFixed(0)}%`} />
				<StatCard label="Technique Risk Score" value={tech.techniqueScore.toString()} />
			</StatGrid>

			{tech.unverifiedTechniques.length > 0 && (
				<WarningCard
					title="Unverified Declarations"
					count={tech.unverifiedTechniques.length}
					description={`The following techniques were declared but could not be confidently verified based on data heuristics: ${tech.unverifiedTechniques.map(t => t.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}.`}
					icon={<AlertTriangle className="h-4 w-4" />}
				/>
			)}

			{tech.detectedTechniques.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{tech.detectedTechniques.map((technique, index) => {
						return (
							<Card key={index} className="border-green-200 dark:border-green-900">
								<CardContent className="p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<ShieldCheck className="h-4 w-4 text-green-500" />
											<h4 className="font-medium capitalize">
												{technique.technique.replace(/-/g, " ")}
											</h4>
										</div>
									</div>
									<p className="text-sm text-muted-foreground mb-3">{technique.description}</p>
									<div className="space-y-2">
										<div className="text-xs font-medium">Protected Attributes:</div>
										<div className="flex flex-wrap gap-1">
											{technique.affectedAttributes.map((attr) => (
												<Badge key={attr} variant="secondary" className="text-xs">{attr}</Badge>
											))}
										</div>
									</div>

									<div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex justify-between">
										<span>Verification Confidence</span>
										<span className="font-medium">{(technique.confidence * 100).toFixed(0)}%</span>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="p-6 text-center">
						<EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
						<p className="font-medium">No techniques verified</p>
						<p className="text-sm text-muted-foreground mt-1">
							None of the evaluated techniques were detected with sufficient confidence.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

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
            title="How Technique Detection Works"
            description="You can declare which anonymization techniques you have applied to your dataset. The system will then mathematically verify their presence using data heuristics. Unverified techniques will be flagged, but your score dynamically adapts to the overall attribute protection coverage based on identifier uniqueness."
            colorVariant="muted"
          />

          {/* Techniques Grid */}
          <div className="space-y-4">
            <h4 className="font-semibold">Supported Techniques</h4>
            
            {/* Generalization */}
            <TechniqueCard
              icon={<Layers className="h-5 w-5 text-blue-500" />}
              title="Generalization"
              description="Replacing specific values with broader categories to reduce granularity."
              benefit="high"
              examples={[
                { before: "Age: 29", after: "Age: 25-30" },
                { before: "City: Seattle", after: "Region: Pacific Northwest" },
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
              description="Removing sensitive values entirely, replacing them with generic placeholders, or omitting direct identifier columns completely."
              benefit="high"
              examples={[
                { before: "SSN: 123-45-6789", after: "SSN: [REDACTED]" },
                { before: "Email: john@test.com", after: "Email: NULL" },
              ]}
              visualBefore={
                <div className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded">
                  <p>John Smith</p>
                  <p>123-45-6789</p>
                  <p>john@email.com</p>
                </div>
              }
              visualAfter={
                <div className="text-xs p-2 bg-green-100 dark:bg-green-950 rounded text-muted-foreground font-mono">
                  <p>[REMOVED]</p>
                  <p>[REDACTED]</p>
                  <p>N/A</p>
                </div>
              }
            />

            {/* Masking */}
            <TechniqueCard
              icon={<Eye className="h-5 w-5 text-pink-500" />}
              title="Masking"
              description="Partially obscuring values while preserving their original structural format."
              benefit="medium"
              examples={[
                { before: "Phone: 555-0198", after: "Phone: 555-****" },
                { before: "Card: 4111222233334444", after: "Card: ****-****-****-4444" },
              ]}
              visualBefore={
                <div className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded flex flex-col gap-1">
                  <div>555-0198</div>
                  <div>555-0245</div>
                </div>
              }
              visualAfter={
                <div className="text-xs p-2 bg-green-100 dark:bg-green-950 rounded flex flex-col gap-1 font-mono">
                  <div>555-****</div>
                  <div>555-****</div>
                </div>
              }
            />

            {/* Hashing */}
            <TechniqueCard
              icon={<Hash className="h-5 w-5 text-slate-500" />}
              title="Hashing"
              description="Applying a one-way cryptographic function to transform values into fixed-length, irreversible strings."
              benefit="high"
              examples={[
                { before: "john@email.com", after: "87b2c5d... (SHA-256)" },
                { before: "Device_01", after: "e4d909c... (MD5)" },
              ]}
              visualBefore={
                <div className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded">
                  <p>john@email.com</p>
                </div>
              }
              visualAfter={
                <div className="text-xs p-2 bg-green-100 dark:bg-green-950 rounded font-mono truncate">
                  <p>87b2c5d6e9f1a3b4...</p>
                </div>
              }
            />

            {/* Pseudonymization */}
            <TechniqueCard
              icon={<UserX className="h-5 w-5 text-indigo-500" />}
              title="Pseudonymization"
              description="Replacing direct identifiers with systematic, artificial pseudonyms to break direct linkage."
              benefit="high"
              examples={[
                { before: "Name: Sarah Connor", after: "ID: PATIENT-001" },
                { before: "Username: coolguy99", after: "ID: USR_8849" },
              ]}
              visualBefore={
                <div className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded flex flex-col gap-1">
                  <div>Sarah Connor</div>
                  <div>Kyle Reese</div>
                </div>
              }
              visualAfter={
                <div className="text-xs p-2 bg-green-100 dark:bg-green-950 rounded flex flex-col gap-1 font-mono">
                  <div>PATIENT-001</div>
                  <div>PATIENT-002</div>
                </div>
              }
            />

            {/* Noise Addition */}
            <TechniqueCard
              icon={<Waves className="h-5 w-5 text-orange-500" />}
              title="Noise Addition"
              description="Injecting random statistical noise into numerical distributions to protect precise values."
              benefit="medium"
              examples={[
                { before: "Salary: $75,000", after: "Salary: $73,247.19" },
                { before: "Location: 40.7128° N", after: "Location: 40.7145° N" },
              ]}
              visualBefore={
                <div className="flex gap-2 text-xs">
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">$75,000</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">$82,000</div>
                </div>
              }
              visualAfter={
                <div className="flex gap-2 text-xs">
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">$73,247.19</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">$84,891.42</div>
                </div>
              }
            />

            {/* Bucketing */}
            <TechniqueCard
              icon={<Archive className="h-5 w-5 text-teal-500" />}
              title="Bucketing"
              description="Grouping continuous values into a small set of discrete qualitative bins."
              benefit="medium"
              examples={[
                { before: "Credit Score: 720", after: "Risk: Low" },
                { before: "Income: $120,000", after: "Bracket: High" },
              ]}
              visualBefore={
                <div className="flex gap-2 text-xs">
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">720</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">610</div>
                  <div className="p-2 bg-red-100 dark:bg-red-950 rounded text-center flex-1">810</div>
                </div>
              }
              visualAfter={
                <div className="flex gap-2 text-xs">
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">Low Risk</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">Med Risk</div>
                  <div className="p-2 bg-green-100 dark:bg-green-950 rounded text-center flex-1">Low Risk</div>
                </div>
              }
            />
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