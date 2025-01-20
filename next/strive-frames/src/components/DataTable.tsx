"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { ArrayCell } from "./ArrayCell";
import { DropdownFilter } from "./DropdownFilter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

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

  // Extract unique values for dropdown filters
  const uniqueValues = useMemo(() => {
    const values: Record<string, Set<string>> = {};
    
    DROPDOWN_FILTER_COLUMNS.forEach((columnId) => {
      values[columnId] = new Set<string>();
      data.forEach((row) => {
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
  }, [data]);

  const processedColumns = useMemo(() => 
    columns.map((col) => {
      const key = (col as { accessorKey?: string }).accessorKey;
      return {
        ...col,
        cell: key && (key.includes("Moves") || key === "cancelOptions")
          ? ({ getValue }: { getValue: () => unknown }) => (
              <ArrayCell value={getValue() as string[] | null} />
            )
          : col.cell,
        enableColumnFilter: true,
        filterFn: key === "level" 
          ? levelFilterFn 
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
    },
  });

  const filterableColumns = table.getAllColumns().filter(
    (column) => column.columnDef.enableColumnFilter !== false
  );

  const dropdownColumns = filterableColumns.filter((column) =>
    DROPDOWN_FILTER_COLUMNS.includes(column.id)
  );

  const textFilterColumns = filterableColumns.filter(
    (column) => !DROPDOWN_FILTER_COLUMNS.includes(column.id)
  );

  return (
    <div className="border border-gray-200">
      <div className="p-4 bg-gray-100">
        {/* Dropdown filters in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          {dropdownColumns.map((column) => (
            <div key={column.id}>
              <label
                htmlFor={column.id}
                className="block text-sm font-medium text-gray-700 mb-1"
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

        {/* Text filters in a grid */}
        {textFilterColumns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {textFilterColumns.map((column) => (
              <div key={column.id}>
                <label
                  htmlFor={column.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                </label>
                <input
                  id={column.id}
                  placeholder={getPlaceholderText(column.id)}
                  value={(column.getFilterValue() as string) ?? ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-x-auto max-h-[70vh] relative">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="bg-gray-200 px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-300 border-b border-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="text-gray-700">
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="even:bg-gray-100 hover:bg-gray-200 border-b border-gray-200 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 