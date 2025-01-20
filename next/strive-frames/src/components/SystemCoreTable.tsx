"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn } from "@/components/ColumnDef";

interface SystemCoreData {
  id: number;
  character: string;
  defense: string | null;
  guts: string | null;
  riscGainModifier: string | null;
  prejump: string | null;
  backdashDuration: string | null;
  backdashInvuln: string | null;
  backdashAirborne: string | null;
  forwardDash: string | null;
  uniqueMovementOptions: string | null;
  movementTensionGain: string | null;
}

const columns: ColumnDef<SystemCoreData>[] = [
  createColumn<SystemCoreData>({
    accessorKey: "character",
    header: <TableHeader>Character</TableHeader>,
    size: 150,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "defense",
    header: (
      <TableHeader>
        <ColumnHeader title="Defense" tooltip="Base defense value affecting damage taken" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "guts",
    header: (
      <TableHeader>
        <ColumnHeader title="Guts" tooltip="Damage reduction at low health" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "riscGainModifier",
    header: (
      <TableHeader>
        <ColumnHeader title="RISC Gain" tooltip="Rate at which RISC gauge builds" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "prejump",
    header: (
      <TableHeader>
        <ColumnHeader title="Pre-jump" tooltip="Frames before becoming airborne" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "backdashDuration",
    header: (
      <TableHeader>
        <ColumnHeader title="Backdash" tooltip="Total backdash duration in frames" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "backdashInvuln",
    header: (
      <TableHeader>
        <ColumnHeader title="Invuln" tooltip="Invulnerability frames during backdash" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "backdashAirborne",
    header: (
      <TableHeader>
        <ColumnHeader title="Airborne" tooltip="Frames airborne during backdash" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "forwardDash",
    header: (
      <TableHeader>
        <ColumnHeader title="F.Dash" tooltip="Forward dash properties" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "uniqueMovementOptions",
    header: (
      <TableHeader>
        <ColumnHeader title="Unique" tooltip="Character-specific movement options" />
      </TableHeader>
    ),
    size: 150,
  }),
  createColumn<SystemCoreData>({
    accessorKey: "movementTensionGain",
    header: (
      <TableHeader>
        <ColumnHeader title="Tension" tooltip="Tension gain from movement" />
      </TableHeader>
    ),
    size: 100,
  }),
];

interface SystemCoreTableProps {
  data: SystemCoreData[];
}

export function SystemCoreTable({ data }: SystemCoreTableProps) {
  return <DataTable columns={columns} data={data} />;
} 