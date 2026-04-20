import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { attributeTypes, HIGH_CONFIDENCE_THRESHOLD } from '@/utils/constants';
import { cn } from '@/lib/utils';

import type { AttributeType, ClassificationResult, AttributeClassification } from '@/types/attribute-classification';
import { WarningDialog } from './warning-dialog';

interface TableClassificationViewProps {
  result: ClassificationResult;
  onUpdateAttribute: (name: string, type: AttributeType, reason?: string) => void;
  editMode: boolean;
}

export function TableClassificationView({
  result,
  onUpdateAttribute,
  editMode
}: TableClassificationViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [warningDialog, setWarningDialog] = useState<{
    attribute: AttributeClassification;
    targetType: AttributeType;
  } | undefined>(undefined);
  const itemsPerPage = 10;

  const sortedAttributes = useMemo(() => {
    return [...result.attributes].sort((a, b) => {
      const typeOrderA = attributeTypes.findIndex(t => t.label === a.type);
      const typeOrderB = attributeTypes.findIndex(t => t.label === b.type);
      if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;
      return a.name.localeCompare(b.name);
    });
  }, [result.attributes]);

  const totalPages = Math.ceil(sortedAttributes.length / itemsPerPage);
  
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  if (currentPage !== validCurrentPage) {
    setCurrentPage(validCurrentPage);
  }

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const currentAttributes = sortedAttributes.slice(startIndex, startIndex + itemsPerPage);

  const handleTypeChange = (attr: AttributeClassification, newType: AttributeType) => {
    if (newType === attr.type) return;

    if (attr.confidence >= HIGH_CONFIDENCE_THRESHOLD && !attr.isManualOverride) {
      setWarningDialog({ attribute: attr, targetType: newType });
    } else {
      onUpdateAttribute(
        attr.name,
        newType,
        `Manually changed from ${
          attributeTypes.find(t => t.label === attr.type)?.title || attr.type
        } to ${
          attributeTypes.find(t => t.label === newType)?.title || newType
        }`
      );
    }
  };

  const typeRowBg: Record<string, string> = {
    'direct-identifier': 'bg-red-500/5 dark:bg-red-950/20 hover:bg-red-500/10 dark:hover:bg-red-950/40',
    'quasi-identifier': 'bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10 dark:hover:bg-amber-950/40',
    'sensitive': 'bg-purple-500/5 dark:bg-purple-950/20 hover:bg-purple-500/10 dark:hover:bg-purple-950/40',
    'non-sensitive': 'bg-green-500/5 dark:bg-green-950/20 hover:bg-green-500/10 dark:hover:bg-green-950/40',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table className='bg-white'>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-border/80">
              <TableHead className="w-1/3">Attribute Name</TableHead>
              <TableHead className="w-1/3">Classification Type</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="w-24 text-right pr-6">Manual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {currentAttributes.flatMap((attr, index) => {
                const isNewGroup = index === 0 || attr.type !== currentAttributes[index - 1].type;
                const typeInfo = attributeTypes.find(t => t.label === attr.type);
                const colors = typeInfo?.color ?? { bg: '', text: '', border: '' };
                const confidenceColor = attr.confidence >= 0.8 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : attr.confidence >= 0.6 
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400';

                const elements = [];

                if (isNewGroup) {
                  const Icon = typeInfo?.icon;
                  elements.push(
                    <TableRow 
                      key={`group-${attr.type}-${validCurrentPage}`} 
                      className="bg-muted/40 hover:bg-muted/40 border-y shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]"
                    >
                      <TableCell colSpan={4} className="py-2.5">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className={cn("h-4 w-4", colors.text)} />}
                          <span className={cn("font-semibold text-sm", colors.text)}>
                            {typeInfo?.title || attr.type}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                elements.push(
                  <motion.tr
                    key={attr.name}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "group border-b border-border/40 transition-colors",
                      typeRowBg[attr.type]
                    )}
                  >
                    <TableCell className="font-medium">{attr.name}</TableCell>
                    <TableCell>
                      {editMode ? (
                        <Select
                          value={attr.type}
                          onValueChange={(val) => handleTypeChange(attr, val as AttributeType)}
                        >
                          <SelectTrigger className="h-9 w-50 bg-background/80 shadow-xs">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {attributeTypes.map((type) => (
                              <SelectItem key={type.label} value={type.label}>
                                {type.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={cn(colors.bg, colors.text, colors.border, "shadow-xs bg-background/50")}>
                          {typeInfo?.title || attr.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-semibold", confidenceColor)}>
                        {(attr.confidence * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {attr.isManualOverride ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs font-medium">No</span>
                      )}
                    </TableCell>
                  </motion.tr>
                );

                return elements;
              })}
            </AnimatePresence>
            {currentAttributes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No attributes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <div className="flex w-25 items-center justify-center text-sm font-medium text-muted-foreground">
            Page {validCurrentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={validCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      <WarningDialog
        warningDialog={warningDialog}
        setWarningDialog={setWarningDialog}
        onUpdateAttribute={onUpdateAttribute}
      />
    </div>
  );
}

export default TableClassificationView;
