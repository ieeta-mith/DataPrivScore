import { useState, useCallback, createElement } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GripVertical,
  AlertTriangle,
  Lock,
  Unlock,
  HelpCircle,
  Info,
  CheckCircle2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedButton, Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpDialogClassification } from '@/components/help-dialogs/classification';

import { attributeTypes } from '@/utils/constants';

import type {
  AttributeClassification,
  AttributeType,
  ClassificationResult,
} from '@/types/attribute-classification';

interface DragDropClassificationViewProps {
  result: ClassificationResult;
  onUpdateAttribute: (name: string, type: AttributeType, reason?: string) => void;
}

const HIGH_CONFIDENCE_THRESHOLD = 0.8;

export function DragDropClassificationView({
  result,
  onUpdateAttribute,
}: DragDropClassificationViewProps) {
  const [draggedAttribute, setDraggedAttribute] = useState<AttributeClassification | null>(null);
  const [dragOverType, setDragOverType] = useState<AttributeType | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [warningDialog, setWarningDialog] = useState<{
    attribute: AttributeClassification;
    targetType: AttributeType;
  } | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, attribute: AttributeClassification) => {
    if (!editMode) return;
    setDraggedAttribute(attribute);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', attribute.name);
  }, [editMode]);

  const handleDragEnd = useCallback(() => {
    setDraggedAttribute(null);
    setDragOverType(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, type: AttributeType) => {
    if (!editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverType(type);
  }, [editMode]);

  const handleDragLeave = useCallback(() => {
    setDragOverType(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetType: AttributeType) => {
    e.preventDefault();
    setDragOverType(null);

    if (!editMode || !draggedAttribute || draggedAttribute.type === targetType) {
      return;
    }

    // Check if high confidence and show warning
    if (draggedAttribute.confidence >= HIGH_CONFIDENCE_THRESHOLD && !draggedAttribute.isManualOverride) {
      setWarningDialog({ attribute: draggedAttribute, targetType });
    } else {
      onUpdateAttribute(
        draggedAttribute.name,
        targetType,
        `Manually moved from ${
          attributeTypes.find(t => t.label === draggedAttribute.type)?.title || draggedAttribute.type
        } to ${
          attributeTypes.find(t => t.label === targetType)?.title || targetType
        }`
      );
    }

    setDraggedAttribute(null);
  }, [editMode, draggedAttribute, onUpdateAttribute]);

  const confirmMove = useCallback(() => {
    if (warningDialog) {
      onUpdateAttribute(
        warningDialog.attribute.name,
        warningDialog.targetType,
        `Manually moved from ${attributeTypes.find(t => t.label === warningDialog.attribute.type)?.title || warningDialog.attribute.type} to ${
          attributeTypes.find(t => t.label === warningDialog.targetType)?.title || warningDialog.targetType
        } (overriding high confidence classification)`
      );
      setWarningDialog(null);
    }
  }, [warningDialog, onUpdateAttribute]);

  return (
    <TooltipProvider delayDuration={200}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>
              {editMode 
                ? 'Drag attributes between boxes to reclassify them' 
                : 'Enable edit mode to modify classifications'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHelpDialogOpen(true)}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Help Guide
          </Button>
          <AnimatedButton
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={`gap-2 transition-all ${editMode ? 'shadow-md' : ''}`}
          >
            {editMode ? (
              <>
                <Unlock className="h-4 w-4" />
                Editing
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Edit Mode
              </>
            )}
          </AnimatedButton>
        </div>
      </div>

      {/* Classification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {attributeTypes.map((type, index) => {
          const colors = type.color;
          const attributes = result.attributes.filter(attr => attr.type === type.label);
          const isDragOver = dragOverType === type.label;

          return (
            <motion.div
              key={type.label}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`h-full transition-all duration-200 overflow-hidden ${
                  isDragOver
                    ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]'
                    : ''
                } ${editMode ? 'shadow-lg hover:shadow-xl' : 'shadow-sm'}`}
                onDragOver={(e) => handleDragOver(e, type.label)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, type.label)}
              >
                {/* Card Header */}
                <CardHeader className={`${colors.bg} border-b p-4 ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 ${colors.text}`}>
                        {createElement(type.icon)}
                      </div>
                      <div>
                        <CardTitle className={`text-sm font-semibold ${colors.text}`}>
                          {type.title}
                        </CardTitle>
                        <p className={`text-xs ${colors.text} opacity-70 mt-0.5`}>
                          {type.short}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`${colors.bg} ${colors.text} border ${colors.border} font-bold text-sm px-2.5`}
                    >
                      {attributes.length}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className={`p-4 min-h-45 transition-colors ${
                  isDragOver ? colors.bg : ''
                }`}>
                  <div className="flex flex-wrap gap-2 content-start">
                    <AnimatePresence mode="popLayout">
                      {attributes.map(attr => (
                        <AttributeChip
                          key={attr.name}
                          attribute={attr}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedAttribute?.name === attr.name}
                          editMode={editMode}
                        />
                      ))}
                    </AnimatePresence>
                    {attributes.length === 0 && (
                      <div className={`w-full flex flex-col items-center justify-center py-8 text-sm rounded-lg border-2 border-dashed ${
                        isDragOver 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {isDragOver ? (
                          <>
                            <CheckCircle2 className="h-6 w-6 mb-2" />
                            <span className="font-medium">Drop to classify</span>
                          </>
                        ) : (
                          <span>{editMode ? 'Drag attributes here' : 'No attributes'}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Help Guide Dialog */}
      <HelpDialogClassification 
        helpDialogOpen={helpDialogOpen}
        setHelpDialogOpen={setHelpDialogOpen}
      />

      {/* High Confidence Warning Dialog */}
      <Dialog open={!!warningDialog} onOpenChange={() => setWarningDialog(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              High Confidence Classification
            </DialogTitle>
            <DialogDescription>
              The attribute <strong>"{warningDialog?.attribute.name}"</strong> was classified as{' '}
              <strong>{warningDialog && warningDialog.attribute.type}</strong>{' '}
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
            <strong>{warningDialog && warningDialog.targetType}</strong>?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirmMove}>
              Move Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

interface AttributeChipProps {
  attribute: AttributeClassification;
  onDragStart: (e: React.DragEvent, attribute: AttributeClassification) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  editMode: boolean;
}

function AttributeChip({ attribute, onDragStart, onDragEnd, isDragging, editMode }: AttributeChipProps) {
  const colors = attributeTypes.find(t => t.label === attribute.type)?.color ?? { bg: '', text: '', border: '' };
  const confidenceColor = attribute.confidence >= 0.8 
    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800' 
    : attribute.confidence >= 0.6 
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          draggable={editMode}
          onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, attribute)}
          onDragEnd={onDragEnd}
          className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background
            transition-all duration-150
            ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
            ${editMode ? 'cursor-grab active:cursor-grabbing hover:border-primary/50' : 'cursor-default'}
            ${colors.border}
          `}
        >
          {editMode && (
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
          <span className="font-medium text-sm truncate">{attribute.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-md border font-semibold ${confidenceColor}`}>
            {(attribute.confidence * 100).toFixed(0)}%
          </span>
          {attribute.isManualOverride && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              Manual
            </Badge>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-center">
        <p className="font-semibold">{attribute.name}</p>
        <p className="text-xs text-muted-foreground">
          {(attribute.confidence * 100).toFixed(0)}% confidence
          {attribute.isManualOverride && ' • Manually set'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default DragDropClassificationView;
