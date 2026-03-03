import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, XCircle, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  const weightPercentage = Math.round(metric.weight * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: 0.1 + index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        {/* Animated top border based on status */}
        <motion.div 
          className={`h-1 ${colors.bg}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
          style={{ transformOrigin: "left" }}
        />
        <CardContent className="p-4">
          {/* Header with name and status */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium truncate">{metric.name}</span>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.08, type: "spring" }}
            >
              <StatusIcon className={`h-4 w-4 ${colors.text}`} />
            </motion.div>
          </div>
          
          {/* Score with animated counter effect */}
          <div className="flex items-baseline gap-2 mb-2">
            <motion.span 
              className={`text-3xl font-bold ${colors.text}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.08 }}
            >
              {Math.round(metric.score)}
            </motion.span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          
          {/* Animated progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
            <motion.div
              className={`h-2 rounded-full ${colors.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(metric.score)}%` }}
              transition={{ 
                delay: 0.3 + index * 0.08, 
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          </div>
          
          {/* Weight badge with tooltip */}
          <div className="flex items-center justify-between mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 text-xs cursor-help hover:bg-muted-foreground/20 transition-colors"
                  >
                    <Scale className="h-3 w-3" />
                    <span>Weight: {weightPercentage}%</span>
                  </Badge>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-50">
                <p className="text-xs">
                  This metric contributes {weightPercentage}% to the overall privacy score.
                  Weighted score: {Math.round(metric.weightedScore)}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Details */}
          <motion.p 
            className="text-xs text-muted-foreground line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.08 }}
          >
            {metric.details}
          </motion.p>
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
