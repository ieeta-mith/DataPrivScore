import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BarChart3,
  PieChart,
  Lock,
  Users,
  Activity,
  Target,
  Lightbulb,
  HelpCircle,
  FileJson,
  FileCode,
} from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { getPrivacyResultData } from "@/lib/storage";
import { downloadHTMLReport } from "@/services/html-report-generator";

import {
  PrivacyScoreCard,
  MetricScoresGrid,
  KAnonymityDetails,
  LDiversityDetails,
  TClosenessDetails,
  TechniqueDetails,
  RiskDetails,
  RecommendationsList,
} from "@/components/privacy-analyis";

import { 
  HelpDialogResults,
  HelpButton,
  HelpDialogKAnonymity,
  HelpDialogLDiversity,
  HelpDialogTCloseness,
  HelpDialogRisk,
  HelpDialogTechniques,
} from "@/components/help-dialogs";

import type { PrivacyIndexResult } from "@/types/privacy-analysis";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

type HelpDialogType = "general" | "kAnonymity" | "lDiversity" | "tCloseness" | "risk" | "techniques" | null;

function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PrivacyIndexResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true,
    kAnonymity: false,
    lDiversity: false,
    tCloseness: false,
    techniques: false,
    risk: false,
    recommendations: true,
  });
  const [activeHelpDialog, setActiveHelpDialog] = useState<HelpDialogType>(null);

  useEffect(() => {
    const data = getPrivacyResultData();
    if (data.privacyResult && data.classification && data.fileName) {
      setResult(data.privacyResult);
      setFileName(data.fileName);
    } else {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBack = () => {
    navigate({ to: "/classify" });
  };

  const handleExportJSON = () => {
    if (!result) return;

    const report = createExportReport(result, fileName);
    downloadReport(report, fileName);
  };

  const handleExportHTML = () => {
    if (!result) return;
    downloadHTMLReport(result, fileName);
  };

  if (!result) {
    return <LoadingState />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <ResultsHeader
            fileName={fileName}
            metadata={result.metadata}
            onBack={handleBack}
            onExportJSON={handleExportJSON}
            onExportHTML={handleExportHTML}
            onHelp={() => setActiveHelpDialog("general")}
          />

          {/* Main Score Card */}
          <PrivacyScoreCard result={result} />

          {/* Metric Scores */}
          <CollapsibleSection
            title="Privacy Metrics Breakdown"
            icon={BarChart3}
            expanded={expandedSections.metrics}
            onToggle={() => toggleSection("metrics")}
            delay={0.15}
          >
            <MetricScoresGrid metrics={result.metricScores} />
          </CollapsibleSection>

          {/* K-Anonymity Details */}
          <CollapsibleSection
            title="K-Anonymity Analysis"
            icon={Users}
            expanded={expandedSections.kAnonymity}
            onToggle={() => toggleSection("kAnonymity")}
            delay={0.2}
            badge={
              <Badge variant={result.kAnonymity.satisfiesKAnonymity ? "safe" : "sensitive"}>
                {result.kAnonymity.satisfiesKAnonymity ? "Satisfied" : "Violated"}
              </Badge>
            }
            helpButton={<HelpButton onClick={() => setActiveHelpDialog("kAnonymity")} />}
          >
            <KAnonymityDetails result={result} />
          </CollapsibleSection>

          {/* L-Diversity Details */}
          <CollapsibleSection
            title="L-Diversity Analysis"
            icon={PieChart}
            expanded={expandedSections.lDiversity}
            onToggle={() => toggleSection("lDiversity")}
            delay={0.25}
            badge={
              <Badge variant={result.lDiversity.satisfiesLDiversity ? "safe" : "sensitive"}>
                {result.lDiversity.satisfiesLDiversity ? "Satisfied" : "Violated"}
              </Badge>
            }
            helpButton={<HelpButton onClick={() => setActiveHelpDialog("lDiversity")} />}
          >
            <LDiversityDetails result={result} />
          </CollapsibleSection>

          {/* T-Closeness Details */}
          <CollapsibleSection
            title="T-Closeness Analysis"
            icon={Activity}
            expanded={expandedSections.tCloseness}
            onToggle={() => toggleSection("tCloseness")}
            delay={0.3}
            badge={
              <Badge variant={result.tCloseness.satisfiesTCloseness ? "safe" : "sensitive"}>
                {result.tCloseness.satisfiesTCloseness ? "Satisfied" : "Violated"}
              </Badge>
            }
            helpButton={<HelpButton onClick={() => setActiveHelpDialog("tCloseness")} />}
          >
            <TClosenessDetails result={result} />
          </CollapsibleSection>

          {/* Privacy Techniques */}
          <CollapsibleSection
            title="Detected Privacy Techniques"
            icon={Lock}
            expanded={expandedSections.techniques}
            onToggle={() => toggleSection("techniques")}
            delay={0.35}
            badge={
              <Badge variant="secondary">
                {result.techniqueDetection.detectedTechniques.length} technique(s)
              </Badge>
            }
            helpButton={<HelpButton onClick={() => setActiveHelpDialog("techniques")} />}
          >
            <TechniqueDetails result={result} />
          </CollapsibleSection>

          {/* Re-identification Risk */}
          <CollapsibleSection
            title="Re-identification Risk Assessment"
            icon={Target}
            expanded={expandedSections.risk}
            onToggle={() => toggleSection("risk")}
            delay={0.4}
            badge={
              <Badge variant={result.reidentificationRisk.riskScore < 30 ? "safe" : result.reidentificationRisk.riskScore < 60 ? "quasi" : "sensitive"}>
                {result.reidentificationRisk.riskScore}% Risk
              </Badge>
            }
            helpButton={<HelpButton onClick={() => setActiveHelpDialog("risk")} />}
          >
            <RiskDetails result={result} />
          </CollapsibleSection>

          {/* Recommendations */}
          <CollapsibleSection
            title="Recommendations"
            icon={Lightbulb}
            expanded={expandedSections.recommendations}
            onToggle={() => toggleSection("recommendations")}
            delay={0.45}
            badge={
              <Badge variant="outline">
                {result.recommendations.length} action(s)
              </Badge>
            }
          >
            <RecommendationsList recommendations={result.recommendations} />
          </CollapsibleSection>

          {/* Analysis Metadata */}
          <AnalysisFooter metadata={result.metadata} timestamp={result.timestamp} />
        </div>
      </div>

      {/* Help Dialogs */}
      <HelpDialogResults 
        open={activeHelpDialog === "general"} 
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
      <HelpDialogKAnonymity 
        open={activeHelpDialog === "kAnonymity"} 
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
      <HelpDialogLDiversity 
        open={activeHelpDialog === "lDiversity"} 
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
      <HelpDialogTCloseness 
        open={activeHelpDialog === "tCloseness"} 
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
      <HelpDialogRisk 
        open={activeHelpDialog === "risk"} 
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
      <HelpDialogTechniques 
        open={activeHelpDialog === "techniques"} 
        onOpenChange={(open) => !open && setActiveHelpDialog(null)}
      />
    </TooltipProvider>
  );
}

// Sub-components for better organization

function LoadingState() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading privacy analysis...</p>
      </div>
    </div>
  );
}

interface ResultsHeaderProps {
  fileName: string | null;
  metadata: PrivacyIndexResult["metadata"];
  onBack: () => void;
  onExportJSON: () => void;
  onExportHTML: () => void;
  onHelp: () => void;
}

function ResultsHeader({ fileName, metadata, onBack, onExportJSON, onExportHTML, onHelp }: ResultsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Privacy Analysis Results</h1>
          <p className="text-muted-foreground text-sm">
            {fileName} • {metadata.recordCount.toLocaleString()} records • {metadata.attributeCount} attributes
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onHelp}>
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onExportJSON} className="gap-2">
          <FileJson className="h-4 w-4" />
          JSON
        </Button>
        <Button onClick={onExportHTML} className="gap-2">
          <FileCode className="h-4 w-4" />
          HTML Report
        </Button>
      </div>
    </motion.div>
  );
}

interface AnalysisFooterProps {
  metadata: PrivacyIndexResult["metadata"];
  timestamp: Date;
}

function AnalysisFooter({ metadata, timestamp }: AnalysisFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 text-center text-sm text-muted-foreground"
    >
      <p>
        Analysis completed in {metadata.analysisDuration.toFixed(2)}ms •{" "}
        {timestamp.toLocaleString()}
      </p>
    </motion.div>
  );
}

// Utility functions

function createExportReport(result: PrivacyIndexResult, fileName: string | null) {
  return {
    fileName,
    timestamp: result.timestamp,
    overallScore: result.overallScore,
    grade: result.grade,
    riskLevel: result.riskLevel,
    metricScores: result.metricScores,
    kAnonymity: {
      kValue: result.kAnonymity.kValue,
      threshold: result.kAnonymity.kThreshold,
      satisfies: result.kAnonymity.satisfiesKAnonymity,
      complianceRate: result.kAnonymity.complianceRate,
      equivalenceClasses: result.kAnonymity.equivalenceClassCount,
    },
    lDiversity: {
      lValue: result.lDiversity.lValue,
      threshold: result.lDiversity.lThreshold,
      satisfies: result.lDiversity.satisfiesLDiversity,
      complianceRate: result.lDiversity.complianceRate,
      type: result.lDiversity.diversityType,
    },
    tCloseness: {
      maxDistance: result.tCloseness.maxDistance,
      threshold: result.tCloseness.tThreshold,
      satisfies: result.tCloseness.satisfiesTCloseness,
      complianceRate: result.tCloseness.complianceRate,
    },
    detectedTechniques: result.techniqueDetection.detectedTechniques.map(t => ({
      technique: t.technique,
      confidence: t.confidence,
      affectedAttributes: t.affectedAttributes,
    })),
    reidentificationRisk: {
      score: result.reidentificationRisk.riskScore,
      probability: result.reidentificationRisk.reidentificationProbability,
      level: result.reidentificationRisk.riskLevel,
    },
    recommendations: result.recommendations,
    metadata: result.metadata,
  };
}

function downloadReport(report: ReturnType<typeof createExportReport>, fileName: string | null) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `privacy-report-${fileName?.replace(".csv", "")}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
