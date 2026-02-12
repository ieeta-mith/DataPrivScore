import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { statusColors } from "@/utils/privacy-styles";
import type { PrivacyIndexResult } from "@/types/privacy-analysis";

type MetricScore = PrivacyIndexResult["metricScores"][0];

interface MetricScoreCardProps {
  metric: MetricScore;
  index?: number;
}

export function MetricScoreCard({ metric, index = 0 }: MetricScoreCardProps) {
  const StatusIcon = metric.status === "pass" 
    ? CheckCircle2 
    : metric.status === "warning" 
      ? AlertTriangle 
      : XCircle;

  const colors = statusColors[metric.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate">{metric.name}</span>
            <StatusIcon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div className="text-3xl font-bold mb-1">{metric.score}</div>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${colors.bg}`}
              style={{ width: `${metric.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{metric.details}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MetricScoresGridProps {
  metrics: MetricScore[];
}

export function MetricScoresGrid({ metrics }: MetricScoresGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <MetricScoreCard key={metric.name} metric={metric} index={index} />
      ))}
    </div>
  );
}
