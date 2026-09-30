import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Users, XCircle } from "lucide-react";

import { InfoCard, StatCard, StatGrid, WarningCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { HelpDialogHeader, InformationSection } from "@/components/help-dialogs/elements";
import SwitchExample from "@/components/switch-example";

import type { PluginDetailsProps, PluginHelpProps } from "@/types/privacy-plugins";
import type { KAnonymityResult } from "../types";

export function KAnonymityDetails({ data }: PluginDetailsProps<KAnonymityResult>) {
	return (
		<div className="space-y-4">
			<StatGrid columns={4}>
				<StatCard label="K-Value Achieved" value={data.kValue.toString()} />
				<StatCard label="K-Threshold" value={data.kThreshold.toString()} />
				<StatCard label="Equivalence Classes" value={data.equivalenceClassCount.toLocaleString()} />
				<StatCard label="Compliance Rate" value={`${data.complianceRate.toFixed(1)}%`} />
			</StatGrid>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<InfoCard title="Quasi-Identifiers Analyzed">
					<div className="flex flex-wrap gap-2">
						{data.quasiIdentifiers.length > 0 ? (
							data.quasiIdentifiers.map((qi) => (
								<Badge key={qi} variant="quasi">{qi}</Badge>
							))
						) : (
							<span className="text-muted-foreground text-sm">No quasi-identifiers found</span>
						)}
					</div>
				</InfoCard>

				<InfoCard title="Class Size Distribution">
					<div className="space-y-1 max-h-32 overflow-y-auto">
						{Object.entries(data.sizeDistribution)
							.sort(([a], [b]) => parseInt(a) - parseInt(b))
							.slice(0, 10)
							.map(([size, count]) => (
								<div key={size} className="flex justify-between text-sm">
									<span>Size {size}:</span>
									<span className="text-muted-foreground">{count} class(es)</span>
								</div>
							))}
					</div>
				</InfoCard>
			</div>

			{data.violatingClasses.length > 0 && (
				<WarningCard
					title="Violating Equivalence Classes"
					count={data.violatingClasses.length}
					description={`These equivalence classes have fewer than ${data.kThreshold} records, making individuals potentially identifiable.`}
					icon={<AlertTriangle className="h-4 w-4" />}
				/>
			)}
		</div>
	)
}

export function KAnonymityHelp({ open, onOpenChange }: PluginHelpProps) {
	const [showAnonymized, setShowAnonymized] = useState(false);

	return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <HelpDialogHeader
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Understanding K-Anonymity"
          description="Protecting identity through indistinguishability"
        />
        <div className="space-y-6 py-4">
          <InformationSection
            icon={<Info className="h-4 w-4 text-blue-500" />}
            title="What is K-Anonymity?"
            description= "K-anonymity ensures that each record in a dataset is indistinguishable from at least k-1 other records based on quasi-identifiers (attributes that could be combined to identify someone, like age, ZIP code, or gender)."
            colorVariant="muted"
          />

          <div className="space-y-4">
            <SwitchExample
              showAnonymized={showAnonymized}
              setShowAnonymized={setShowAnonymized}
              option1="Original (k=1)"
              option2="Anonymized (k=2)"
            />
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Age</th>
                    <th className="px-4 py-2 text-left font-medium">ZIP Code</th>
                    <th className="px-4 py-2 text-left font-medium">Gender</th>
                    <th className="px-4 py-2 text-left font-medium">
                      <Badge variant="sensitive" className="text-xs">Sensitive</Badge>
                      {" "}Disease
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {!showAnonymized ? (
                    <>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2">29</td>
                        <td className="px-4 py-2">13053</td>
                        <td className="px-4 py-2">Male</td>
                        <td className="px-4 py-2">Heart Disease</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Unique</Badge></td>
                      </tr>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2">22</td>
                        <td className="px-4 py-2">13068</td>
                        <td className="px-4 py-2">Female</td>
                        <td className="px-4 py-2">Diabetes</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Unique</Badge></td>
                      </tr>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2">27</td>
                        <td className="px-4 py-2">13053</td>
                        <td className="px-4 py-2">Male</td>
                        <td className="px-4 py-2">Flu</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Unique</Badge></td>
                      </tr>
                      <tr className="border-t bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-4 py-2">24</td>
                        <td className="px-4 py-2">13068</td>
                        <td className="px-4 py-2">Female</td>
                        <td className="px-4 py-2">Cancer</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">Unique</Badge></td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2 font-medium">20-30</td>
                        <td className="px-4 py-2 font-medium">1305*</td>
                        <td className="px-4 py-2">Male</td>
                        <td className="px-4 py-2">Heart Disease</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A</Badge></td>
                      </tr>
                      <tr className="border-t bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-4 py-2 font-medium">20-30</td>
                        <td className="px-4 py-2 font-medium">1305*</td>
                        <td className="px-4 py-2">Male</td>
                        <td className="px-4 py-2">Flu</td>
                        <td className="px-4 py-2"><Badge variant="safe" className="text-xs">Group A</Badge></td>
                      </tr>
                      <tr className="border-t bg-purple-50/50 dark:bg-purple-950/20">
                        <td className="px-4 py-2 font-medium">20-30</td>
                        <td className="px-4 py-2 font-medium">1306*</td>
                        <td className="px-4 py-2">Female</td>
                        <td className="px-4 py-2">Diabetes</td>
                        <td className="px-4 py-2"><Badge variant="quasi" className="text-xs">Group B</Badge></td>
                      </tr>
                      <tr className="border-t bg-purple-50/50 dark:bg-purple-950/20">
                        <td className="px-4 py-2 font-medium">20-30</td>
                        <td className="px-4 py-2 font-medium">1306*</td>
                        <td className="px-4 py-2">Female</td>
                        <td className="px-4 py-2">Cancer</td>
                        <td className="px-4 py-2"><Badge variant="quasi" className="text-xs">Group B</Badge></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <InformationSection
              icon={!showAnonymized ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
              title={!showAnonymized ? "Privacy Risk: k=1 (No Anonymity)" : "Protected: k=2 Anonymity Achieved"}
              description={
                !showAnonymized 
                  ? "Each record has a unique combination of quasi-identifiers. If an attacker knows someone is a 29-year-old male from ZIP 13053, they can identify exactly one person and learn their medical condition."
                  : "By generalizing ages to ranges and ZIP codes to prefixes, each group now contains at least 2 records. An attacker knowing someone is a male in their 20s from ZIP 1305* cannot distinguish between 2 people."
              }
              colorVariant={showAnonymized ? "sucess" : "error"}
            /> 
          </div>

          {/* Key Points */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Key Points</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Higher k = Better privacy</strong> - More people share the same quasi-identifier values</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Recommended k ≥ 5</strong> for most applications, higher for sensitive data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Trade-off:</strong> Higher k means more generalization, potentially reducing data utility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Limitation:</strong> Doesn't protect against attribute disclosure if all members of a group share the same sensitive value</span>
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
	)
}