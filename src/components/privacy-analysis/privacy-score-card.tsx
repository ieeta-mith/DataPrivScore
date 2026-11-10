import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { riskLevelStyles } from "@/utils/privacy-styles";
import { getUIExtension } from "@/core/ui-registry";
import type { PrivacyIndexResult } from "@/core/privacy-index";

interface PrivacyScoreCardProps {
  result: PrivacyIndexResult;
}

export function PrivacyScoreCard({ result }: PrivacyScoreCardProps) {
  const riskStyle = riskLevelStyles[result.riskLevel];
  const RiskIcon = riskStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <Card className="overflow-hidden">
        <div className={`h-2 ${riskStyle.bg}`} />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <ScoreCircle score={result.overallScore} style={riskStyle} />
            <RiskLevelDisplay
              riskLevel={result.riskLevel}
              riskStyle={riskStyle}
              RiskIcon={RiskIcon}
            />
            <QuickStats result={result} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ScoreCircleProps {
  score: number;
  style: { text: string };
}

function ScoreCircle({ score, style }: ScoreCircleProps) {
  const roundedScore = Math.round(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted/90"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={440}
            initial={{ strokeDashoffset: 440 }}
            animate={{ strokeDashoffset: 440 - (440 * roundedScore) / 100 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            strokeLinecap="round"
            className={style.text}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-5xl font-bold ${style.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {roundedScore}
          </motion.span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
      </div>
      <motion.div
        className="mt-4 text-xl font-bold text-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: "spring" }}
      >
        Overall Score
      </motion.div>
    </div>
  );
}

interface RiskLevelDisplayProps {
  riskLevel: string;
  riskStyle: { bg: string; text: string, circleBg?: string };
  RiskIcon: React.ComponentType<{ className?: string }>;
}

function RiskLevelDisplay({ riskLevel, riskStyle, RiskIcon }: RiskLevelDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`p-4 rounded-full ${riskStyle.circleBg || "bg-muted/50"}`}>
        <RiskIcon className={`h-12 w-12 ${riskStyle.text}`} />
      </div>
      <div className="text-center">
        <p className={`text-2xl font-bold capitalize ${riskStyle.text}`}>
          {riskLevel} Risk
        </p>
      </div>
    </div>
  );
}

function QuickStats({ result }: { result: PrivacyIndexResult }) {
  return (
    <div className="space-y-3">
      {result.results.map((pluginResult) => {
        const uiExt = getUIExtension(pluginResult.pluginId);
        if (!uiExt) return null;

        return (
          <div key={pluginResult.pluginId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <uiExt.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{uiExt.title}</span>
            </div>
            <Badge
              variant={
                pluginResult.output.status === 'pass' ? "safe" :
                  pluginResult.output.status === 'warning' ? "quasi" :
                    "sensitive"
              }
            >
              {uiExt.formatQuickStat ? uiExt.formatQuickStat(pluginResult.output.result) : `${Math.round(pluginResult.output.score)}/100`}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}