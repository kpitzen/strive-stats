"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn } from "@/components/ColumnDef";

interface SystemJumpData {
  id: number;
  character: string;
  jumpDuration: string | null;
  highJumpDuration: string | null;
  jumpHeight: string | null;
  highJumpHeight: string | null;
  preInstantAirDash: string | null;
  airDashDuration: string | null;
  airBackdashDuration: string | null;
  airDashDistance: string | null;
  airBackdashDistance: string | null;
  jumpingTensionGain: string | null;
  airDashTensionGain: string | null;
}

const columns: ColumnDef<SystemJumpData>[] = [
  createColumn<SystemJumpData>({
    accessorKey: "character",
    header: <TableHeader>Character</TableHeader>,
    size: 150,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "jumpDuration",
    header: (
      <TableHeader>
        <ColumnHeader title="Jump Duration" tooltip="Total frames for a normal jump" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "highJumpDuration",
    header: (
      <TableHeader>
        <ColumnHeader title="High Jump Duration" tooltip="Total frames for a high jump" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "jumpHeight",
    header: (
      <TableHeader>
        <ColumnHeader title="Jump Height" tooltip="Maximum height of a normal jump" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "highJumpHeight",
    header: (
      <TableHeader>
        <ColumnHeader title="High Jump Height" tooltip="Maximum height of a high jump" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "preInstantAirDash",
    header: (
      <TableHeader>
        <ColumnHeader title="Pre-IAD" tooltip="Frames before instant air dash becomes active" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "airDashDuration",
    header: (
      <TableHeader>
        <ColumnHeader title="Air Dash Duration" tooltip="Total frames for an air dash" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "airBackdashDuration",
    header: (
      <TableHeader>
        <ColumnHeader title="Air Backdash Duration" tooltip="Total frames for an air backdash" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "airDashDistance",
    header: (
      <TableHeader>
        <ColumnHeader title="Air Dash Distance" tooltip="Distance covered by an air dash" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "airBackdashDistance",
    header: (
      <TableHeader>
        <ColumnHeader title="Air Backdash Distance" tooltip="Distance covered by an air backdash" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "jumpingTensionGain",
    header: (
      <TableHeader>
        <ColumnHeader title="Jump Tension Gain" tooltip="Tension gained from jumping" />
      </TableHeader>
    ),
    size: 100,
  }),
  createColumn<SystemJumpData>({
    accessorKey: "airDashTensionGain",
    header: (
      <TableHeader>
        <ColumnHeader title="Air Dash Tension Gain" tooltip="Tension gained from air dashing" />
      </TableHeader>
    ),
    size: 100,
  }),
];

interface SystemJumpTableProps {
  data: SystemJumpData[];
}

export function SystemJumpTable({ data }: SystemJumpTableProps) {
  return <DataTable columns={columns} data={data} />;
} 