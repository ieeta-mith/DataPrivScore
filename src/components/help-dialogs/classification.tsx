import { 
	Dialog, 
	DialogContent, 
	DialogHeader, 
	DialogTitle,
	DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { HelpCircle, Info } from "lucide-react";
import { attributeTypes } from "@/utils/constants";
import React from "react";
import { AnimatedButton } from "@/components/ui/button";
import type { AttributeTypeInfo } from "@/types/attribute-classification";

interface HelpDialogClassificationProps {
  helpDialogOpen: boolean;
  setHelpDialogOpen: (open: boolean) => void;
}

export const HelpDialogClassification = ({ 
  helpDialogOpen, 
  setHelpDialogOpen 
}: HelpDialogClassificationProps) => {
  return (
    <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-primary" />
            Classification Guide
          </DialogTitle>
          <DialogDescription>
            Understanding attribute types for privacy analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overview */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Why Classification Matters
            </h4>
            <p className="text-sm text-muted-foreground">
              Proper attribute classification is essential for applying privacy
              models like k-anonymity, l-diversity, and t-closeness. Each
              attribute type requires different protection strategies to prevent
              re-identification of individuals in your dataset.
            </p>
          </div>

          {/* Attribute Types */}
          <div className="space-y-4">
            {attributeTypes.map((attribute) => (
              <AttributeTypeRepresentation key={attribute.label} attribute={attribute} />
            ))}
          </div>

          {/* Confidence Levels */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Confidence Levels</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-medium">
                  80%+
                </span>
                <span className="text-sm text-muted-foreground">
                  High confidence - classification is very likely correct
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-medium">
                  60-79%
                </span>
                <span className="text-sm text-muted-foreground">
                  Medium confidence - review recommended
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-medium">
                  &lt;60%
                </span>
                <span className="text-sm text-muted-foreground">
                  Low confidence - manual verification needed
                </span>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">How to Reclassify Attributes</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>
                Click the <strong>"Edit Mode"</strong> button to enable drag and
                drop
              </li>
              <li>Drag an attribute chip from one category to another</li>
              <li>
                For high-confidence items, a confirmation dialog will appear
              </li>
              <li>
                Click <strong>"Edit Mode"</strong> again to lock your changes
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <AnimatedButton onClick={() => setHelpDialogOpen(false)}>
            Got it
          </AnimatedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AttributeTypeRepresentation = ({ attribute }: { attribute: AttributeTypeInfo }) => {
  return (
    <div
      key={attribute.label}
      className={`p-4 rounded-lg border ${attribute.color.border} ${attribute.color.bg}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg bg-white/60 dark:bg-black/20 ${attribute.color.text}`}
        >
          {React.createElement(attribute.icon, { className: "h-6 w-6" })}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${attribute.color.text}`}>
            {attribute.title}
          </h4>
          <p className={`text-sm mt-1 ${attribute.color.text} opacity-80`}>
            {attribute.short}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-medium ${attribute.color.text}`}>
              Examples:
            </span>
            <span className={`text-xs ${attribute.color.text} opacity-70`}>
              {attribute.examples}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
