import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GripVertical,
  CheckCircle2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { attributeTypes, CONFIDENCE_COLOR } from '@/utils/constants';

import type {
  AttributeClassification,
  AttributeType,
  ClassificationView,
} from '@/types/attribute-classification';

export function DragDropClassificationView({
  result,
  editMode,
  handleWarningDialog
}: ClassificationView) {

  const [draggedAttribute, setDraggedAttribute] = useState<AttributeClassification | null>(null);
  const [dragOverType, setDragOverType] = useState<AttributeType | null>(null);

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

    handleWarningDialog(draggedAttribute, targetType);

    setDraggedAttribute(null);
  }, [editMode, draggedAttribute, handleWarningDialog]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {attributeTypes.map((type, index) => {
          const colors = type.color;
          const attributes = result.attributes.filter(attr => attr.type === type.label);
          const isDragOver = dragOverType === type.label;
          const Icon = type.icon;

          return (
            <motion.div
              key={type.label}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`h-full transition-all duration-200 overflow-hidden ${isDragOver
                  ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]'
                  : ''
                  } ${editMode ? 'shadow-lg hover:shadow-xl' : 'shadow-sm'}`}
                onDragOver={(e) => handleDragOver(e, type.label)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, type.label)}
              >
                <CardHeader className={`${colors.bg} border-b p-4 ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 ${colors.text}`}>
                        <Icon />
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

                <CardContent className={`p-4 min-h-45 transition-colors ${isDragOver ? colors.bg : ''
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
                      <div className={`w-full flex flex-col items-center justify-center py-8 text-sm rounded-lg border-2 border-dashed ${isDragOver
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
    </>
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
  const confidenceColor = CONFIDENCE_COLOR.find(c => c.label === attribute.confidence)?.color ?? 'text-muted-foreground';

  return (
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
        {attribute.confidence}
      </span>
    </motion.div>
  );
}

export default DragDropClassificationView;
