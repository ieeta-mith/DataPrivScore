import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid, InfoCard, WarningCard } from "@/components/ui/stat-card";
import type { PrivacyIndexResult } from "@/types/privacy-analysis";

interface KAnonymityDetailsProps {
  result: PrivacyIndexResult;
}

export function KAnonymityDetails({ result }: KAnonymityDetailsProps) {
  const k = result.kAnonymity;
  
  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard label="K-Value Achieved" value={k.kValue.toString()} />
        <StatCard label="K-Threshold" value={k.kThreshold.toString()} />
        <StatCard label="Equivalence Classes" value={k.equivalenceClassCount.toLocaleString()} />
        <StatCard label="Compliance Rate" value={`${k.complianceRate.toFixed(1)}%`} />
      </StatGrid>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Quasi-Identifiers Analyzed">
          <div className="flex flex-wrap gap-2">
            {k.quasiIdentifiers.length > 0 ? (
              k.quasiIdentifiers.map((qi) => (
                <Badge key={qi} variant="quasi">{qi}</Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No quasi-identifiers found</span>
            )}
          </div>
        </InfoCard>
        
        <InfoCard title="Class Size Distribution">
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(k.sizeDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .slice(0, 10)
              .map(([size, count]) => (
                <div key={size} className="flex justify-between text-sm">
                  <span>Size {size}:</span>
                  <span className="text-muted-foreground">{count} class(es)</span>
                </div>
              ))}
          </div>
        </InfoCard>
      </div>

      {k.violatingClasses.length > 0 && (
        <WarningCard
          title="Violating Equivalence Classes"
          count={k.violatingClasses.length}
          description={`These equivalence classes have fewer than ${k.kThreshold} records, making individuals potentially identifiable.`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      )}
    </div>
  );
}

interface LDiversityDetailsProps {
  result: PrivacyIndexResult;
}

export function LDiversityDetails({ result }: LDiversityDetailsProps) {
  const l = result.lDiversity;
  
  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard label="L-Value Achieved" value={l.lValue.toString()} />
        <StatCard label="L-Threshold" value={l.lThreshold.toString()} />
        <StatCard label="Diversity Type" value={l.diversityType} />
        <StatCard label="Average Entropy" value={l.averageEntropy.toFixed(3)} />
      </StatGrid>
      
      <InfoCard title="Sensitive Attributes Analyzed">
        <div className="flex flex-wrap gap-2">
          {l.sensitiveAttributes.length > 0 ? (
            l.sensitiveAttributes.map((sa) => (
              <Badge key={sa} variant="sensitive">{sa}</Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No sensitive attributes found</span>
          )}
        </div>
      </InfoCard>

      {l.violatingClasses.length > 0 && (
        <WarningCard
          title="Violating Classes"
          count={l.violatingClasses.length}
          description="These equivalence classes have insufficient diversity in sensitive attribute values."
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      )}
    </div>
  );
}

interface TClosenessDetailsProps {
  result: PrivacyIndexResult;
}

export function TClosenessDetails({ result }: TClosenessDetailsProps) {
  const t = result.tCloseness;
  
  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard label="Max Distance" value={t.maxDistance.toFixed(4)} />
        <StatCard label="T-Threshold" value={t.tThreshold.toString()} />
        <StatCard label="Average Distance" value={t.averageDistance.toFixed(4)} />
        <StatCard label="Compliance Rate" value={`${t.complianceRate.toFixed(1)}%`} />
      </StatGrid>
      
      <InfoCard title="Sensitive Attribute Analyzed">
        {t.sensitiveAttribute ? (
          <Badge variant="sensitive">{t.sensitiveAttribute}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No sensitive attribute analyzed</span>
        )}
      </InfoCard>

      {t.violatingClasses.length > 0 && (
        <WarningCard
          title="Violating Classes"
          count={t.violatingClasses.length}
          description="These equivalence classes have distributional skew exceeding the threshold."
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      )}
    </div>
  );
}
