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

import { attributeTypes, CONFIDENCE_COLOR } from '@/utils/constants';
import { cn } from '@/lib/utils';

import type { AttributeType, ClassificationView, AttributeClassification } from '@/types/attribute-classification';

export function TableClassificationView({
  result,
  editMode,
  handleWarningDialog
}: ClassificationView) {

  const [currentPage, setCurrentPage] = useState(1);
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
    handleWarningDialog(attr, newType);
  };

  const typeRowBg: Record<string, string> = {
    'direct-identifier': 'bg-red-500/5 hover:bg-red-500/10',
    'quasi-identifier': 'bg-amber-500/5 hover:bg-amber-500/10 ',
    'sensitive': 'bg-purple-500/5 hover:bg-purple-500/10',
    'non-sensitive': 'bg-green-500/5 hover:bg-green-500/10',
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
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {currentAttributes.flatMap((attr, index) => {
                const isNewGroup = index === 0 || attr.type !== currentAttributes[index - 1].type;
                const typeInfo = attributeTypes.find(t => t.label === attr.type);
                const colors = typeInfo?.color ?? { bg: '', text: '', border: '' };
                const confidenceColor = CONFIDENCE_COLOR.find(c => c.label === attr.confidence)?.color ?? 'text-muted-foreground';

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
                      <span className={cn("font-semibold p-2 rounded-lg", confidenceColor)}>
                        {attr.confidence}
                      </span>
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
    </div>
  );
}

export default TableClassificationView;
