import { CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityStyles, priorityBadgeVariants } from "@/utils/privacy-styles";
import type { PrivacyRecommendation } from "@/types/privacy-analysis";

interface RecommendationsListProps {
  recommendations: PrivacyRecommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return <NoRecommendationsCard />;
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: PrivacyRecommendation;
}

function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
  const style = priorityStyles[rec.priority];
  const badgeVariant = priorityBadgeVariants[rec.priority];

  return (
    <Card className={`border-l-4 ${style.border} ${style.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={badgeVariant} className="capitalize">
                {rec.priority}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {rec.category}
              </Badge>
            </div>
            <h4 className="font-medium mb-1">{rec.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Expected impact: +{rec.expectedImpact} points
              </span>
              {rec.affectedAttributes.length > 0 && (
                <span>Affects: {rec.affectedAttributes.join(", ")}</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 rounded bg-muted/50 text-sm">
          <strong>Action:</strong> {rec.action}
        </div>
      </CardContent>
    </Card>
  );
}

function NoRecommendationsCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-muted-foreground">No recommendations - your dataset is well protected!</p>
      </CardContent>
    </Card>
  );
}
