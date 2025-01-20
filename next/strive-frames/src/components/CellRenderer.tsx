"use client";

import { CellContext } from "@tanstack/react-table";
import { TableCell } from "./TableCell";

export function CellRenderer<TData>() {
  return function Cell(props: CellContext<TData, unknown>) {
    return <TableCell value={props.getValue()} />;
  };
}

CellRenderer.displayName = "CellRenderer"; 