"use client";

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  ColumnDef,
} from '@tanstack/react-table';
import { useState, useMemo } from "react";
import { ArrayCell } from "./ArrayCell";
import { Table } from './srcl/Table';
import { TableRow } from './srcl/TableRow';
import { TableColumn } from './srcl/TableColumn';
import { DropdownFilter } from "./DropdownFilter";
import { FrameTooltip } from "./FrameTooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
import styles from './srcl/Table.module.scss';

const DROPDOWN_FILTER_COLUMNS = ["character", "input", "startup", "guard", "level", "counterType"];

// Helper function to extract numeric value from startup string
function getStartupValue(startup: string): number {
  if (!startup) return Infinity;
  // Extract first number from string (handles cases like "16~39", "2", etc.)
  const match = startup.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

// Custom filter function for level field
const levelFilterFn = (
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string
): boolean => {
  const value = row.getValue(columnId);
  if (!value || !filterValue) return true;
  return value.toString().includes(filterValue.toString());
};

// Add this new filter function
const multiSelectFilterFn = (
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string[]
): boolean => {
  const value = row.getValue(columnId);
  if (!value || !filterValue || filterValue.length === 0) return true;
  
  // For input column, check if any selected value is a prefix of the cell value
  if (columnId === "input") {
    return filterValue.some(filter => value.toString().startsWith(filter));
  }
  
  // For other columns (like character), use exact match
  return filterValue.includes(value.toString());
};

// Helper function to get placeholder text for a column
function getPlaceholderText(columnId: string): string {
  switch (columnId) {
    case "character":
      return "Select character...";
    case "input":
      return "Select input...";
    case "startup":
      return "Select startup frames...";
    case "guard":
      return "Select guard type...";
    case "level":
      return "Select attack level...";
    case "counterType":
      return "Select counter type...";
    default:
      return `Filter ${columnId}...`;
  }
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "character", desc: false }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const processedColumns = useMemo(() => 
    columns.map((col) => {
      const key = (col as { accessorKey?: string }).accessorKey;
      const isMultiSelect = key === "character" || key === "input";
      return {
        ...col,
        cell: key && (key.includes("Moves") || key === "cancelOptions")
          ? ({ getValue }: { getValue: () => unknown }) => (
              <ArrayCell value={getValue() as string[] | null} />
            )
          : key && (key === "onBlock" || key === "onHit")
          ? ({ getValue }: { getValue: () => unknown }) => {
              const value = getValue();
              return typeof value === "string" ? <FrameTooltip value={value} /> : value;
            }
          : col.cell,
        enableColumnFilter: true,
        filterFn: key === "level" 
          ? levelFilterFn 
          : isMultiSelect
            ? multiSelectFilterFn
            : DROPDOWN_FILTER_COLUMNS.includes(key || "") 
              ? "equals" as const
              : "includesString" as const,
      } as ColumnDef<TData, TValue>;
    }),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        notes: false
      }
    },
  });

  // Extract unique values from currently filtered rows
  const columnFiltersState = table.getState().columnFilters;
  const characterFilter = columnFiltersState.find(f => f.id === "character");

  const uniqueValues = useMemo(() => {
    const values: Record<string, Set<string>> = {};
    
    // Get all characters from the original data
    values["character"] = new Set<string>();
    data.forEach((row) => {
      const value = row["character"];
      if (typeof value === "string") {
        values["character"].add(value);
      }
    });

    // Get rows filtered by character selection only
    const rowsToUse = characterFilter 
      ? data.filter(row => {
          const charValue = row["character"];
          return Array.isArray(characterFilter.value) && characterFilter.value.includes(charValue);
        })
      : data;

    // Get other filter values from character-filtered rows
    DROPDOWN_FILTER_COLUMNS.filter(col => col !== "character").forEach((columnId) => {
      values[columnId] = new Set<string>();
      rowsToUse.forEach((row) => {
        const value = row[columnId];
        if (typeof value === "string") {
          // For level field, split on commas and add each value
          if (columnId === "level") {
            const levels = value.split(/[,\s]+/);
            levels.forEach(level => {
              if (level) values[columnId].add(level);
            });
          } else {
            values[columnId].add(value);
          }
        }
      });
    });

    // Sort values, with special handling for startup column
    return Object.fromEntries(
      Object.entries(values).map(([key, set]) => {
        const array = Array.from(set);
        if (key === "startup") {
          return [key, array.sort((a, b) => getStartupValue(a) - getStartupValue(b))];
        }
        if (key === "level") {
          // Sort levels numerically
          return [key, array.sort((a, b) => {
            const numA = parseInt(a, 10) || 0;
            const numB = parseInt(b, 10) || 0;
            return numA - numB;
          })];
        }
        return [key, array.sort()];
      })
    );
  }, [data, characterFilter]);

  const filterableColumns = table.getAllColumns().filter(
    (column) => column.columnDef.enableColumnFilter !== false && column.getIsVisible()
  );

  const dropdownColumns = filterableColumns.filter((column) =>
    DROPDOWN_FILTER_COLUMNS.includes(column.id)
  );

  const textFilterColumns = filterableColumns.filter(
    (column) => !DROPDOWN_FILTER_COLUMNS.includes(column.id)
  );

  return (
    <TooltipProvider>
      <div className="p-4" style={{ background: 'var(--theme-background-modal)' }}>
        {/* Dropdown filters in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          {dropdownColumns.map((column) => (
            <div key={column.id}>
              <label
                htmlFor={column.id}
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-text)' }}
              >
                {column.id === "counterType" ? "Counter" : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
              </label>
              <DropdownFilter
                column={column}
                options={uniqueValues[column.id] || []}
                placeholder={getPlaceholderText(column.id)}
              />
            </div>
          ))}
        </div>

        {/* Text filters in an accordion */}
        {textFilterColumns.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="text-filters" className="border-none">
              <AccordionTrigger 
                className="text-sm font-medium py-2 px-4 hover:no-underline w-fit hover:bg-[var(--theme-focused-foreground-subdued)]"
                style={{ color: 'var(--theme-text)' }}
              >
                Additional Filters
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {textFilterColumns.map((column) => (
                    <div key={column.id}>
                      <label
                        htmlFor={column.id}
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                      </label>
                      <input
                        id={column.id}
                        placeholder={getPlaceholderText(column.id)}
                        value={(column.getFilterValue() as string) ?? ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="w-full px-3 py-2"
                        style={{
                          background: 'var(--theme-background-input)',
                          color: 'var(--theme-text)',
                          border: '1px solid var(--theme-border)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      <div className={styles.root}>
        <Table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableColumn
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span style={{ color: 'var(--theme-text)' }}>
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    </div>
                  </TableColumn>
                ))}
              </TableRow>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableColumn key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableColumn>
                ))}
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </TooltipProvider>
  );
} 