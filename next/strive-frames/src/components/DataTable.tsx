"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { ExpandableRow } from "./ExpandableRow";
import { levelFilterFn, multiSelectFilterFn } from "./filters";
import { PlusIcon, MinusIcon } from "@radix-ui/react-icons";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
import styles from './srcl/Table.module.scss';

const DROPDOWN_FILTER_COLUMNS = ["character", "input", "startup", "guard", "level", "counterType"];

const BREAKPOINTS = {
  lg: 1280,  // Full size - show all columns
  md: 1024,  // Medium - hide priority 3 columns
  sm: 768,   // Small - hide priority 2 and 3 columns
};

type ExtendedColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  accessorKey?: string;
  priority?: 1 | 2 | 3;
  size?: number;
};

// Helper function to extract numeric value from startup string
function getStartupValue(startup: string): number {
  if (!startup) return Infinity;
  // Extract first number from string (handles cases like "16~39", "2", etc.)
  const match = startup.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

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
  const [windowWidth, setWindowWidth] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Add resize listener
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      const extendedCol = col as ExtendedColumnDef<TData, TValue>;
      const key = extendedCol.accessorKey;
      const priority = extendedCol.priority || 1;

      if (key) {
        if (windowWidth < BREAKPOINTS.sm) {
          // On small screens, only show priority 1 columns
          visibility[key] = priority === 1;
        } else if (windowWidth < BREAKPOINTS.md) {
          // On medium screens, show priority 1 and 2 columns
          visibility[key] = priority <= 2;
        } else {
          // On large screens, show all columns
          visibility[key] = true;
        }
      }
    });
    return visibility;
  }, [columns, windowWidth]);

  const processedColumns = useMemo(() => 
    columns.map((col) => {
      const extendedCol = col as ExtendedColumnDef<TData, TValue>;
      const key = extendedCol.accessorKey;
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
      columnVisibility,
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

  const hiddenColumns = useMemo(() => {
    return Object.entries(columnVisibility)
      .filter(([, isVisible]) => !isVisible)
      .map(([key]) => key);
  }, [columnVisibility]);

  const toggleRow = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

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
          <thead className="sticky top-0 backdrop-blur-sm" 
            style={{ 
              background: 'var(--theme-background-modal)',
              backgroundColor: 'rgba(var(--theme-background-modal-rgb), 0.95)'
            }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {hiddenColumns.length > 0 && (
                  <TableColumn className="w-10 px-3" 
                    style={{ 
                      background: 'transparent'
                    }}>
                    <span className="sr-only">Toggle details</span>
                  </TableColumn>
                )}
                {headerGroup.headers.map((header) => {
                  const extendedCol = header.column.columnDef as ExtendedColumnDef<TData, TValue>;
                  return (
                    <TableColumn
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-2 min-h-[40px]"
                      style={{ 
                        cursor: 'pointer', 
                        width: extendedCol.size,
                        background: 'transparent',
                        color: 'var(--theme-text)',
                      }}
                    >
                      <div className="flex items-center gap-2 hover:opacity-80">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span>
                          {{
                            asc: "↑",
                            desc: "↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    </TableColumn>
                  );
                })}
              </TableRow>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow 
                  className="border-t border-gray-200 transition-colors duration-100"
                >
                  {hiddenColumns.length > 0 && (
                    <TableColumn className="w-10 px-3 align-middle">
                      <button
                        onClick={() => toggleRow(row.id)}
                        className="flex items-center justify-center w-full min-h-[40px] mx-2"
                        aria-label={expandedRows[row.id] ? "Collapse row" : "Expand row"}
                      >
                        {expandedRows[row.id] ? (
                          <MinusIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <PlusIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </TableColumn>
                  )}
                  {row.getVisibleCells().map((cell, index) => (
                    <TableColumn 
                      key={cell.id} 
                      className={`min-h-[40px] py-2 align-middle px-4 ${index === 0 && hiddenColumns.length === 0 ? 'pl-3' : ''}`}
                    >
                      <div className="flex items-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </TableColumn>
                  ))}
                </TableRow>
                {hiddenColumns.length > 0 && (
                  <TableRow key={`${row.id}-expanded`} data-expanded="true">
                    <TableColumn colSpan={row.getVisibleCells().length + 1}>
                      <ExpandableRow 
                        row={row} 
                        hiddenColumns={hiddenColumns}
                        isExpanded={expandedRows[row.id] || false}
                      />
                    </TableColumn>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>
    </TooltipProvider>
  );
} 