"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn, createHiddenColumn } from "@/components/ColumnDef";
import { NotesIcon } from "@/components/NotesIcon";

interface SpecialMoves extends Record<string, unknown> {
  id: number;
  character: string;
  tableName: string;
  tableType: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
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

const columns: ColumnDef<SpecialMoves>[] = [
  createColumn<SpecialMoves>({
    accessorKey: "character",
    header: <TableHeader>Character</TableHeader>,
    size: 150,
    priority: 1,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "name",
    header: (
      <TableHeader>
        <ColumnHeader title="Name" tooltip="Name of the special move" />
      </TableHeader>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const notes = row.getValue("notes") as string | null;
      return (
        <div className="flex items-center">
          <span>{name}</span>
          <NotesIcon notes={notes} />
        </div>
      );
    },
    size: 200,
    priority: 1,
  }),
  createHiddenColumn<SpecialMoves>("notes"),
  createColumn<SpecialMoves>({
    accessorKey: "input",
    header: (
      <TableHeader>
        <ColumnHeader title="Input" tooltip="Command input for the move" />
      </TableHeader>
    ),
    size: 150,
    priority: 1,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "damage",
    header: (
      <TableHeader>
        <ColumnHeader title="Damage" tooltip="Base damage of the move" />
      </TableHeader>
    ),
    size: 100,
    priority: 1,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "guard",
    header: (
      <TableHeader>
        <ColumnHeader title="Guard" tooltip="Guard type (All, High, Low)" />
      </TableHeader>
    ),
    size: 100,
    priority: 2,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "startup",
    header: (
      <TableHeader>
        <ColumnHeader title="Startup" tooltip="Startup frames" />
      </TableHeader>
    ),
    size: 100,
    priority: 1,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "active",
    header: (
      <TableHeader>
        <ColumnHeader title="Active" tooltip="Active frames" />
      </TableHeader>
    ),
    size: 100,
    priority: 2,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "recovery",
    header: (
      <TableHeader>
        <ColumnHeader title="Recovery" tooltip="Recovery frames" />
      </TableHeader>
    ),
    size: 100,
    priority: 2,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "onBlock",
    header: (
      <TableHeader>
        <ColumnHeader title="On Block" tooltip="Frame advantage on block" />
      </TableHeader>
    ),
    size: 100,
    priority: 1,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "onHit",
    header: (
      <TableHeader>
        <ColumnHeader title="On Hit" tooltip="Frame advantage on hit" />
      </TableHeader>
    ),
    size: 100,
    priority: 1,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "level",
    header: (
      <TableHeader>
        <ColumnHeader title="Level" tooltip="Attack level" />
      </TableHeader>
    ),
    size: 100,
    priority: 3,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "counterType",
    header: (
      <TableHeader>
        <ColumnHeader title="Counter" tooltip="Counter hit type" />
      </TableHeader>
    ),
    size: 100,
    priority: 3,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "invuln",
    header: (
      <TableHeader>
        <ColumnHeader title="Invuln" tooltip="Invulnerability frames" />
      </TableHeader>
    ),
    size: 100,
    priority: 3,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "proration",
    header: (
      <TableHeader>
        <ColumnHeader title="Proration" tooltip="Damage proration" />
      </TableHeader>
    ),
    size: 100,
    priority: 3,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "riscGain",
    header: (
      <TableHeader>
        <ColumnHeader title="RISC+" tooltip="RISC gain on block" />
      </TableHeader>
    ),
    size: 100,
    priority: 3,
  }),
  createColumn<SpecialMoves>({
    accessorKey: "riscLoss",
    header: (
      <TableHeader>
        <ColumnHeader title="RISC-" tooltip="RISC loss on hit" />
      </TableHeader>
    ),
    size: 100,
    priority: 3,
  }),
];

interface SpecialMovesTableProps {
  data: SpecialMoves[];
}

export function SpecialMovesTable({ data }: SpecialMovesTableProps) {
  return <DataTable<SpecialMoves, unknown> columns={columns} data={data} />;
} 