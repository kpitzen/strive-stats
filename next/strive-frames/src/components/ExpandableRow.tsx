"use client";

import { Row } from "@tanstack/react-table";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface ExpandableRowProps<TData> {
  row: Row<TData>;
  hiddenColumns: string[];
  isExpanded: boolean;
}

export function ExpandableRow<TData>({ row, hiddenColumns, isExpanded }: ExpandableRowProps<TData>) {
  if (hiddenColumns.length === 0) return null;

  return (
    <Collapsible open={isExpanded}>
      <CollapsibleContent className="px-4 py-2 bg-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
          {hiddenColumns.map((columnId) => {
            const value = row.getValue(columnId);
            if (value == null) return null;
            
            return (
              <div key={columnId} className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                </span>
                <span className="text-sm text-gray-900">{String(value)}</span>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 