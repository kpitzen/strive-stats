"use client";

import { ReactNode } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";

interface Column<T> {
  accessorKey: keyof T & string;
  header: ReactNode;
  size?: number;
  cell?: (props: { row: Row<T> }) => ReactNode;
}

export function createColumn<T extends Record<string, unknown>>(column: Column<T>): ColumnDef<T> {
  return {
    ...column,
    accessorKey: column.accessorKey,
    enableHiding: false,
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
    show: false,
  } as ColumnDef<T>;
} 