"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn } from "@/components/ColumnDef";

interface GatlingTable {
  id: number;
  character: string;
  tableName: string;
  tableType: string;
  createdAt: Date;
  updatedAt: Date;
  pMoves: string[] | null;
  kMoves: string[] | null;
  sMoves: string[] | null;
  hMoves: string[] | null;
  dMoves: string[] | null;
  cancelOptions: string[] | null;
}

const columns: ColumnDef<GatlingTable>[] = [
  createColumn<GatlingTable>({
    accessorKey: "character",
    header: <TableHeader>Character</TableHeader>,
    size: 150,
  }),
  createColumn<GatlingTable>({
    accessorKey: "pMoves",
    header: (
      <TableHeader>
        <ColumnHeader title="P → Moves" tooltip="Moves that can be gatling'd into from P" />
      </TableHeader>
    ),
    size: 200,
  }),
  createColumn<GatlingTable>({
    accessorKey: "kMoves",
    header: (
      <TableHeader>
        <ColumnHeader title="K → Moves" tooltip="Moves that can be gatling'd into from K" />
      </TableHeader>
    ),
    size: 200,
  }),
  createColumn<GatlingTable>({
    accessorKey: "sMoves",
    header: (
      <TableHeader>
        <ColumnHeader title="S → Moves" tooltip="Moves that can be gatling'd into from S" />
      </TableHeader>
    ),
    size: 200,
  }),
  createColumn<GatlingTable>({
    accessorKey: "hMoves",
    header: (
      <TableHeader>
        <ColumnHeader title="H → Moves" tooltip="Moves that can be gatling'd into from H" />
      </TableHeader>
    ),
    size: 200,
  }),
  createColumn<GatlingTable>({
    accessorKey: "dMoves",
    header: (
      <TableHeader>
        <ColumnHeader title="D → Moves" tooltip="Moves that can be gatling'd into from D" />
      </TableHeader>
    ),
    size: 200,
  }),
  createColumn<GatlingTable>({
    accessorKey: "cancelOptions",
    header: (
      <TableHeader>
        <ColumnHeader title="Special Cancels" tooltip="Special move cancel options" />
      </TableHeader>
    ),
    size: 250,
  }),
];

interface GatlingTableProps {
  data: GatlingTable[];
}

export function GatlingTable({ data }: GatlingTableProps) {
  return <DataTable columns={columns} data={data} />;
} 