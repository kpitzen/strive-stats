"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn } from "@/components/ColumnDef";

interface Character {
  id: number;
  name: string;
  slug: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const columns: ColumnDef<Character>[] = [
  createColumn<Character>({
    accessorKey: "displayName",
    header: <TableHeader>Character</TableHeader>,
    size: 150,
  }),
  createColumn<Character>({
    accessorKey: "name",
    header: (
      <TableHeader>
        <ColumnHeader title="Internal Name" tooltip="Internal name used in the game" />
      </TableHeader>
    ),
    size: 150,
  }),
  createColumn<Character>({
    accessorKey: "slug",
    header: (
      <TableHeader>
        <ColumnHeader title="URL Identifier" tooltip="URL-friendly identifier" />
      </TableHeader>
    ),
    size: 150,
  }),
];

interface CharactersTableProps {
  data: Character[];
}

export function CharactersTable({ data }: CharactersTableProps) {
  return <DataTable columns={columns} data={data} />;
} 