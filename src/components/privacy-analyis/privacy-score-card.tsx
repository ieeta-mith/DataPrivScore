import { motion } from "motion/react";
import { Users, PieChart, Activity, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { gradeStyles, riskLevelStyles } from "@/utils/privacy-styles";
import type { PrivacyIndexResult } from "@/types/privacy-analysis";

interface PrivacyScoreCardProps {
  result: PrivacyIndexResult;
}

export function PrivacyScoreCard({ result }: PrivacyScoreCardProps) {
  const gradeStyle = gradeStyles[result.grade];
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
        <div className={`h-2 ${gradeStyle.bg}`} />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Score Circle */}
            <ScoreCircle score={result.overallScore} grade={result.grade} gradeStyle={gradeStyle} />

            {/* Risk Level */}
            <RiskLevelDisplay 
              riskLevel={result.riskLevel}
              reidentificationProbability={result.reidentificationRisk.reidentificationProbability}
              riskStyle={riskStyle}
              RiskIcon={RiskIcon}
            />

            {/* Quick Stats */}
            <QuickStats result={result} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ScoreCircleProps {
  score: number;
  grade: string;
  gradeStyle: { bg: string; text: string; border: string };
}

function ScoreCircle({ score, grade, gradeStyle }: ScoreCircleProps) {
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
            className="text-muted/20"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * score) / 100}
            strokeLinecap="round"
            className={gradeStyle.text}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${gradeStyle.text}`}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
      </div>
      <div className={`mt-4 text-6xl font-bold ${gradeStyle.text}`}>
        {grade}
      </div>
      <p className="text-sm text-muted-foreground mt-1">Privacy Grade</p>
    </div>
  );
}

interface RiskLevelDisplayProps {
  riskLevel: string;
  reidentificationProbability: number;
  riskStyle: { bg: string; text: string };
  RiskIcon: React.ComponentType<{ className?: string }>;
}

function RiskLevelDisplay({ riskLevel, reidentificationProbability, riskStyle, RiskIcon }: RiskLevelDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`p-4 rounded-full ${riskStyle.bg}`}>
        <RiskIcon className={`h-12 w-12 ${riskStyle.text}`} />
      </div>
      <div className="text-center">
        <p className={`text-2xl font-bold capitalize ${riskStyle.text}`}>
          {riskLevel} Risk
        </p>
        <p className="text-sm text-muted-foreground">
          {(reidentificationProbability * 100).toFixed(2)}% re-identification probability
        </p>
      </div>
    </div>
  );
}

interface QuickStatsProps {
  result: PrivacyIndexResult;
}

function QuickStats({ result }: QuickStatsProps) {
  const stats = [
    {
      icon: Users,
      label: "K-Anonymity",
      value: `k = ${result.kAnonymity.kValue}`,
      satisfied: result.kAnonymity.satisfiesKAnonymity,
    },
    {
      icon: PieChart,
      label: "L-Diversity",
      value: `l = ${result.lDiversity.lValue}`,
      satisfied: result.lDiversity.satisfiesLDiversity,
    },
    {
      icon: Activity,
      label: "T-Closeness",
      value: `t = ${result.tCloseness.maxDistance.toFixed(3)}`,
      satisfied: result.tCloseness.satisfiesTCloseness,
    },
    {
      icon: Lock,
      label: "Techniques",
      value: `${result.techniqueDetection.detectedTechniques.length} detected`,
      satisfied: null, // neutral
    },
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat) => (
        <QuickStatItem key={stat.label} {...stat} />
      ))}
    </div>
  );
}

interface QuickStatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  satisfied: boolean | null;
}

function QuickStatItem({ icon: Icon, label, value, satisfied }: QuickStatItemProps) {
  const variant = satisfied === null 
    ? "secondary" 
    : satisfied 
      ? "safe" 
      : "sensitive";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <Badge variant={variant}>{value}</Badge>
    </div>
  );
}
