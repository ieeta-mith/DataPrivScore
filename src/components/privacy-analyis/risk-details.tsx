import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import type { PrivacyIndexResult } from "@/types/privacy-analysis";

interface RiskDetailsProps {
  result: PrivacyIndexResult;
}

export function RiskDetails({ result }: RiskDetailsProps) {
  const risk = result.reidentificationRisk;
  
  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard label="Overall Risk" value={`${risk.riskScore}%`} />
        <StatCard label="Prosecutor Risk" value={`${risk.prosecutorRisk.toFixed(1)}%`} />
        <StatCard label="Journalist Risk" value={`${risk.journalistRisk.toFixed(1)}%`} />
        <StatCard label="Marketer Risk" value={`${risk.marketerRisk.toFixed(1)}%`} />
      </StatGrid>
      
      {risk.riskFactors.length > 0 && (
        <RiskFactorsList factors={risk.riskFactors} />
      )}
    </div>
  );
}

interface RiskFactorsListProps {
  factors: PrivacyIndexResult["reidentificationRisk"]["riskFactors"];
}

function RiskFactorsList({ factors }: RiskFactorsListProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium mb-3">Risk Factors</h4>
        <div className="space-y-3">
          {factors.map((factor, index) => (
            <RiskFactorItem key={index} factor={factor} isLast={index === factors.length - 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskFactorItemProps {
  factor: PrivacyIndexResult["reidentificationRisk"]["riskFactors"][0];
  isLast: boolean;
}

function RiskFactorItem({ factor, isLast }: RiskFactorItemProps) {
  const impactVariant = factor.impact > 30 
    ? "sensitive" 
    : factor.impact > 15 
      ? "quasi" 
      : "outline";

  return (
    <div className={`${!isLast ? "border-b pb-3" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{factor.factor}</span>
        <Badge variant={impactVariant}>
          Impact: {factor.impact}%
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{factor.description}</p>
      <p className="text-xs text-primary mt-1">💡 {factor.mitigation}</p>
    </div>
  );
}
