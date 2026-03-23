import { AlertTriangle } from "lucide-react"; 

import { 
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/ui/button";
import { attributeTypes } from "@/utils/constants";

import type { AttributeClassification, AttributeType } from "@/types/attribute-classification";
import { useCallback } from "react";

interface WarningDialogProps {
	warningDialog?: {
		attribute: AttributeClassification;
		targetType: AttributeType
	}
	setWarningDialog?: (dialog: WarningDialogProps['warningDialog'] | undefined) => void;
	onUpdateAttribute?: (name: string, type: AttributeType, reason?: string) => void;
}

export const WarningDialog = ({ warningDialog, setWarningDialog, onUpdateAttribute }: WarningDialogProps) => {
	const confirmMove = useCallback(() => {
    if (warningDialog) {
      onUpdateAttribute?.(
        warningDialog.attribute.name,
        warningDialog.targetType,
        `Manually changed from ${attributeTypes.find(t => t.label === warningDialog.attribute.type)?.title || warningDialog.attribute.type} to ${
          attributeTypes.find(t => t.label === warningDialog.targetType)?.title || warningDialog.targetType
        } (overriding high confidence classification)`
      );
      setWarningDialog?.(undefined);
    }
  }, [warningDialog, onUpdateAttribute, setWarningDialog]);

	return (
		<Dialog open={!!warningDialog} onOpenChange={() => setWarningDialog?.(undefined)}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-amber-600">
						<AlertTriangle className="h-5 w-5" />
						High Confidence Classification
					</DialogTitle>
					<DialogDescription>
						The attribute <strong>"{warningDialog?.attribute.name}"</strong> was classified as{' '}
						<strong>{warningDialog && (attributeTypes.find(t => t.label === warningDialog.attribute.type)?.title || warningDialog.attribute.type)}</strong>{' '}
						with <strong>{warningDialog && (warningDialog.attribute.confidence * 100).toFixed(0)}% confidence</strong>.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
						<p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
							<strong>Classification Reason:</strong>
						</p>
						<p className="text-sm text-amber-700 dark:text-amber-300">
							{warningDialog?.attribute.classificationReason}
						</p>
					</div>
				</div>

				<p className="text-sm text-muted-foreground">
					Are you sure you want to move it to{' '}
					<strong>{warningDialog && (attributeTypes.find(t => t.label === warningDialog.targetType)?.title || warningDialog.targetType)}</strong>?
				</p>

				<DialogFooter>
					<AnimatedButton variant="outline" onClick={() => setWarningDialog?.(undefined)}>
						Cancel
					</AnimatedButton>
					<AnimatedButton onClick={confirmMove}>
						Change Anyway
					</AnimatedButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}