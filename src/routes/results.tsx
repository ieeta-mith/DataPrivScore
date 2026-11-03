import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  HelpCircle,
  FileJson,
  FileCode,
} from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AnimatedButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { usePrivacyStore } from "@/lib/storage";
// import { downloadHTMLReport } from "@/services/html-report-generator";
import { getUIExtension } from "@/core/ui-registry";

import {
  PrivacyScoreCard,
  MetricScoresGrid,
} from "@/components/privacy-analysis";

import { HelpDialogResults, HelpButton } from "@/components/help-dialogs/results";
import type { PrivacyIndexResult } from "@/core/privacy-index";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const { privacyResult: result, classificationResult, fileName } = usePrivacyStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true,
    recommendations: true,
  });

  const [activeHelpDialog, setActiveHelpDialog] = useState<string | null>(null);

  useEffect(() => {
    if (!result || !classificationResult || !fileName) {
      navigate({ to: "/" });
    }
  }, [result, classificationResult, fileName, navigate]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!result) return <LoadingState />;

  const genericResult = result as PrivacyIndexResult;
  console.log("Generic Result:", genericResult);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <PageHeader
            title="Privacy Analysis Results"
            backDescription="Back to Configuration"
            handleFunc={() => navigate({ to: "/configure" })}
            subTitle={
              <p className="text-muted-foreground text-sm">
                {fileName} • {genericResult.metadata.recordCount.toLocaleString()} records • {genericResult.metadata.attributeCount} attributes
              </p>
            }
            actionSection={
              <>
                <AnimatedButton variant="outline" size="icon" onClick={() => setActiveHelpDialog("general")}>
                  <HelpCircle className="h-4 w-4" />
                </AnimatedButton>
                <AnimatedButton variant="outline" className="gap-2">
                  <FileJson className="h-4 w-4" /> JSON
                </AnimatedButton>
                <AnimatedButton className="gap-2">
                  <FileCode className="h-4 w-4" /> HTML Report
                </AnimatedButton>
              </>
            }
          />

          <PrivacyScoreCard result={genericResult} />

          <CollapsibleSection
            title="Privacy Metrics Breakdown"
            icon={BarChart3}
            expanded={expandedSections.metrics}
            onToggle={() => toggleSection("metrics")}
            delay={0.15}
          >
            <MetricScoresGrid metrics={genericResult.results} />
          </CollapsibleSection>

          {genericResult.results.map((pluginExecution, index) => {
            const uiExt = getUIExtension(pluginExecution.pluginId);
            if (!uiExt) return null;

            const isExpanded = expandedSections[pluginExecution.pluginId] || false;
            const DetailsComponent = uiExt.DetailsComponent;
            const HelpComponent = uiExt.HelpComponent;
            const output = pluginExecution.output;

            return (
              <div key={pluginExecution.pluginId}>
                <CollapsibleSection
                  title={uiExt.title}
                  icon={uiExt.icon}
                  expanded={isExpanded}
                  onToggle={() => toggleSection(pluginExecution.pluginId)}
                  delay={0.2 + (index * 0.05)}
                  badge={
                    <Badge
                      variant={
                        output.status === 'pass' ? "safe" :
                          output.status === 'warning' ? "quasi" :
                            "sensitive"
                      }
                    >
                      {
                        output.status === 'pass' ? "Satisfied" :
                          output.status === 'warning' ? "Warning" :
                            "Violated"
                      }
                    </Badge>
                  }
                  helpButton={HelpComponent && <HelpButton onClick={() => setActiveHelpDialog(pluginExecution.pluginId)} />}
                >
                  <DetailsComponent data={output.result} />
                </CollapsibleSection>

                {HelpComponent && (
                  <HelpComponent
                    open={activeHelpDialog === pluginExecution.pluginId}
                    onOpenChange={(open) => !open && setActiveHelpDialog(null)}
                  />
                )}
              </div>
            );
          })}
          <AnalysisFooter analysisDuration={genericResult.metadata.analysisDuration} timestamp={genericResult.timestamp} />
        </div>
      </div>

      <HelpDialogResults
        open={activeHelpDialog === "general"}
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
    </TooltipProvider>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

function AnalysisFooter({ analysisDuration, timestamp }: { analysisDuration: number, timestamp: Date }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 text-center text-sm text-muted-foreground"
    >
      <p>Analysis completed in {analysisDuration.toFixed(2)}ms • {timestamp.toLocaleString()}</p>
    </motion.div>
  );
}