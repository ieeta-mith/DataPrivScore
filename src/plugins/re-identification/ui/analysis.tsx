import { useState } from 'react';
import { Info, Target, User, Newspaper, TrendingUp, AlertTriangle, Calculator } from 'lucide-react';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { AnimatedButton } from '@/components/ui/button';
import { HelpDialogHeader, InformationSection } from '@/components/help-dialogs/elements';

import type { PluginDetailsProps, PluginHelpProps } from '@/types/privacy-plugins';
import type { ReIdentificationRiskResult } from '../types';
import { Badge } from '@/components/ui/badge';

export function RiskDetails({ data }: PluginDetailsProps<ReIdentificationRiskResult>) {
  // Identify which risk is the bottleneck
  const isProsecutorMax = data.maxRisk === data.prosecutorRisk;
  const isJournalistMax = data.maxRisk === data.journalistRisk;
  const isMarketerMax = data.maxRisk === data.marketerRisk;

  return (
    <div className="space-y-4">
      {/* 1. Primary Score Banner */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 p-4 rounded-xl border bg-primary/5 border-primary/20 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-1">Final Risk Score</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{data.score.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Calculated as 100 - Max Risk ({data.maxRisk.toFixed(1)}%)
            </p>
          </div>
          <Target className="h-10 w-10 text-primary/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
        <div className={`p-4 rounded-lg border flex flex-col gap-3 ${isProsecutorMax ? 'border-red-200 bg-red-50/30 dark:border-red-900/30' : 'bg-muted/30'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <User className={`h-4 w-4 ${isProsecutorMax ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className="font-semibold text-sm">Prosecutor Risk</span>
            </div>
            {isProsecutorMax && <Badge variant="sensitive" className="text-[10px]">Max Risk</Badge>}
          </div>
          <span className="text-2xl font-bold">{data.prosecutorRisk.toFixed(1)}%</span>
          <div className="pt-3 border-t border-dashed mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calculator className="h-3 w-3" />
              <span className="font-medium">Calculation:</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on the smallest group size (<strong className="text-foreground">k_min = {data.kMin}</strong>). 
              <br/>Formula: 1 / {data.kMin}
            </p>
          </div>
        </div>

        {/* Journalist Card */}
        <div className={`p-4 rounded-lg border flex flex-col gap-3 ${isJournalistMax && !isProsecutorMax ? 'border-orange-200 bg-orange-50/30 dark:border-orange-900/30' : 'bg-muted/30'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className={`h-4 w-4 ${isJournalistMax && !isProsecutorMax ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="font-semibold text-sm">Journalist Risk</span>
            </div>
            {isJournalistMax && !isProsecutorMax && <Badge variant="quasi" className="text-[10px]">Max Risk</Badge>}
          </div>
          <span className="text-2xl font-bold">{data.journalistRisk.toFixed(1)}%</span>
          <div className="pt-3 border-t border-dashed mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calculator className="h-3 w-3" />
              <span className="font-medium">Calculation:</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Prosecutor risk scaled by the sampling fraction (<strong className="text-foreground">ρ = {data.samplingFraction.toFixed(2)}</strong>).
              <br/>Formula: {data.prosecutorRisk.toFixed(1)}% × {data.samplingFraction.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Marketer Card */}
        <div className={`p-4 rounded-lg border flex flex-col gap-3 ${isMarketerMax && !isProsecutorMax && !isJournalistMax ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/30' : 'bg-muted/30'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${isMarketerMax && !isProsecutorMax && !isJournalistMax ? 'text-blue-500' : 'text-muted-foreground'}`} />
              <span className="font-semibold text-sm">Marketer Risk</span>
            </div>
            {isMarketerMax && !isProsecutorMax && !isJournalistMax && <Badge variant="safe" className="text-[10px]">Max Risk</Badge>}
          </div>
          <span className="text-2xl font-bold">{data.marketerRisk.toFixed(1)}%</span>
          <div className="pt-3 border-t border-dashed mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calculator className="h-3 w-3" />
              <span className="font-medium">Calculation:</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on the average group size (<strong className="text-foreground">k_avg = {data.kAvg.toFixed(1)}</strong>).
              <br/>Formula: 1 / {data.kAvg.toFixed(1)}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export function RiskHelp({ open, onOpenChange }: PluginHelpProps) {
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
          Risk = Number of unique records / Total records (or Prosecutor Risk × Sampling Fraction)
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
