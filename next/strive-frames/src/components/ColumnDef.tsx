"use client";

import { ReactNode } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";

interface Column<T> {
  accessorKey: keyof T & string;
  header: ReactNode;
  size?: number;
  priority?: 1 | 2 | 3; // 1 = highest priority (always show), 3 = lowest (hide first)
  cell?: (props: { row: Row<T> }) => ReactNode;
}

export function createColumn<T extends Record<string, unknown>>(column: Column<T>): ColumnDef<T> {
  return {
    ...column,
    accessorKey: column.accessorKey,
    enableHiding: true, // Changed to true to support dynamic hiding
    priority: column.priority || 1, // Default to highest priority if not specified
    cell: column.cell || (({ getValue }) => {
      const value = getValue();
      return value != null ? String(value) : "";
    }),
  } as ColumnDef<T>;
}

export function createHiddenColumn<T extends Record<string, unknown>>(key: keyof T & string): ColumnDef<T> {
  return {
    accessorKey: key,
    enableHiding: true,
    enableColumnFilter: false,
    show: false,
    header: () => null,
  } as ColumnDef<T>;
} 