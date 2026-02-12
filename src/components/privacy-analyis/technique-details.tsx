import { EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import type { PrivacyIndexResult } from "@/types/privacy-analysis";

interface TechniqueDetailsProps {
  result: PrivacyIndexResult;
}

export function TechniqueDetails({ result }: TechniqueDetailsProps) {
  const tech = result.techniqueDetection;
  
  return (
    <div className="space-y-4">
      <StatGrid columns={3}>
        <StatCard label="Techniques Detected" value={tech.detectedTechniques.length.toString()} />
        <StatCard label="Coverage" value={`${(tech.techniqueCoverage * 100).toFixed(0)}%`} />
        <StatCard label="Technique Score" value={tech.techniqueScore.toString()} />
      </StatGrid>
      
      {tech.detectedTechniques.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tech.detectedTechniques.map((technique, index) => (
            <TechniqueCard key={index} technique={technique} />
          ))}
        </div>
      ) : (
        <NoTechniquesCard />
      )}
    </div>
  );
}

interface TechniqueCardProps {
  technique: PrivacyIndexResult["techniqueDetection"]["detectedTechniques"][0];
}

function TechniqueCard({ technique }: TechniqueCardProps) {
  const benefitVariant = technique.privacyBenefit === "high" 
    ? "safe" 
    : technique.privacyBenefit === "medium" 
      ? "quasi" 
      : "outline";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium capitalize">
            {technique.technique.replace(/-/g, " ")}
          </h4>
          <Badge variant={benefitVariant}>
            {technique.privacyBenefit} benefit
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{technique.description}</p>
        <div className="flex flex-wrap gap-1">
          {technique.affectedAttributes.map((attr) => (
            <Badge key={attr} variant="secondary" className="text-xs">{attr}</Badge>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Confidence: {(technique.confidence * 100).toFixed(0)}%
        </div>
      </CardContent>
    </Card>
  );
}

function NoTechniquesCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center">
        <EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No privacy techniques detected</p>
        <p className="text-sm text-muted-foreground mt-1">
          Consider applying privacy-preserving techniques to protect sensitive data.
        </p>
      </CardContent>
    </Card>
  );
}
