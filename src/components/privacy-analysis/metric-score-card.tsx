import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, XCircle, Scale } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { statusColors } from "@/utils/privacy-styles";

import type { PluginExecutionResult } from "@/types/privacy-plugins";

interface MetricScoreCardProps {
  metric: PluginExecutionResult;
  index?: number;
}

export function MetricScoreCard({ metric, index = 0 }: MetricScoreCardProps) {
  const status = metric.output.status;
  const StatusIcon = status === "pass" 
    ? CheckCircle2 
    : status === "warning" 
      ? AlertTriangle 
      : XCircle;

  const colors = statusColors[status];
  const weightPercentage = Math.round(metric.weight * 100);
  const score = Math.round(metric.output.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, type: "spring" }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        <motion.div className={`h-1 ${colors.bg}`} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium truncate">{metric.pluginName}</span>
            <StatusIcon className={`h-4 w-4 ${colors.text}`} />
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div className={`h-2 rounded-full ${colors.bg}`} style={{ width: `${score}%` }} />
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Scale className="h-3 w-3" />
              <span>Weight: {weightPercentage}%</span>
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {metric.output.details}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MetricScoresGrid({ metrics }: { metrics: PluginExecutionResult[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <MetricScoreCard key={metric.pluginId} metric={metric} index={index} />
      ))}
    </div>
  );
}