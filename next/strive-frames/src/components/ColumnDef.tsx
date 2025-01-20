"use client";

import { ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell } from "./TableCell";

interface Column<T> {
  accessorKey: keyof T;
  header: ReactNode;
  size?: number;
}

export function createColumn<T>(column: Column<T>): ColumnDef<T> {
  return {
    accessorKey: column.accessorKey as string,
    header: () => column.header,
    cell: ({ getValue }) => <TableCell value={getValue()} />,
    size: column.size,
  };
} 