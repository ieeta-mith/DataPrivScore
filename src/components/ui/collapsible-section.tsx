import { motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  delay?: number;
  badge?: React.ReactNode;
  helpButton?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
  delay = 0,
  badge,
  helpButton,
}: CollapsibleSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-4"
    >
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors px-6 py-4"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge}
              {helpButton && (
                <div onClick={(e) => e.stopPropagation()}>
                  {helpButton}
                </div>
              )}
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {expanded && <CardContent className="px-6 pb-6">{children}</CardContent>}
      </Card>
    </motion.div>
  );
}

interface CollapsibleSectionState {
  [key: string]: boolean;
}

export function useCollapsibleSections(initialState: CollapsibleSectionState) {
  const toggle = (
    setExpanded: React.Dispatch<React.SetStateAction<CollapsibleSectionState>>,
    section: string
  ) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return { initialState, toggle };
}
