"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn, createHiddenColumn } from "@/components/ColumnDef";
import { NotesIcon } from "@/components/NotesIcon";

interface NormalMoves extends Record<string, unknown> {
  id: number;
  character: string;
  tableName: string;
  tableType: string;
  createdAt: Date;
  updatedAt: Date;
  input: string;
  damage: string | null;
  guard: string | null;
  startup: string | null;
  active: string | null;
  recovery: string | null;
  onBlock: string | null;
  onHit: string | null;
  level: string | null;
  counterType: string | null;
  invuln: string | null;
  proration: string | null;
  riscGain: string | null;
  riscLoss: string | null;
  notes: string | null;
}

const columns: ColumnDef<NormalMoves>[] = [
  createColumn<NormalMoves>({
    accessorKey: "character",
    header: <TableHeader>Character</TableHeader>,
    size: 150,
  }),
  createColumn<NormalMoves>({
    accessorKey: "input",
    header: (
      <TableHeader>
        <ColumnHeader title="Input" tooltip="Input command for the move" />
      </TableHeader>
    ),
    cell: ({ row }) => {
      const input = row.getValue("input") as string;
      const notes = row.getValue("notes") as string | null;
      return (
        <div className="flex items-center">
          <span>{input}</span>
          <NotesIcon notes={notes} />
        </div>
      );
    },
    size: 100,
  }),
  createHiddenColumn<NormalMoves>("notes"),
  createColumn<NormalMoves>({
    accessorKey: "damage",
    header: (
      <TableHeader>
        <ColumnHeader title="Damage" tooltip="Base damage of the move" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "guard",
    header: (
      <TableHeader>
        <ColumnHeader title="Guard" tooltip="Guard type (All, High, Low)" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "startup",
    header: (
      <TableHeader>
        <ColumnHeader title="Startup" tooltip="Startup frames" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "active",
    header: (
      <TableHeader>
        <ColumnHeader title="Active" tooltip="Active frames" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "recovery",
    header: (
      <TableHeader>
        <ColumnHeader title="Recovery" tooltip="Recovery frames" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "onBlock",
    header: (
      <TableHeader>
        <ColumnHeader title="On Block" tooltip="Frame advantage on block" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "onHit",
    header: (
      <TableHeader>
        <ColumnHeader title="On Hit" tooltip="Frame advantage on hit" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "level",
    header: (
      <TableHeader>
        <ColumnHeader title="Level" tooltip="Attack level" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "counterType",
    header: (
      <TableHeader>
        <ColumnHeader title="Counter" tooltip="Counter hit type" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "invuln",
    header: (
      <TableHeader>
        <ColumnHeader title="Invuln" tooltip="Invulnerability frames" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "proration",
    header: (
      <TableHeader>
        <ColumnHeader title="Proration" tooltip="Damage proration" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "riscGain",
    header: (
      <TableHeader>
        <ColumnHeader title="RISC+" tooltip="RISC gain on block" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<NormalMoves>({
    accessorKey: "riscLoss",
    header: (
      <TableHeader>
        <ColumnHeader title="RISC-" tooltip="RISC loss on hit" />
      </TableHeader>
    ),
    size: 100,
  }),
];

interface NormalMovesTableProps {
  data: NormalMoves[];
}

export function NormalMovesTable({ data }: NormalMovesTableProps) {
  return <DataTable<NormalMoves, unknown> columns={columns} data={data} />;
} 