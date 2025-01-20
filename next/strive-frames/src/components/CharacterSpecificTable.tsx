"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ColumnHeader";
import { TableHeader } from "@/components/TableHeader";
import { createColumn } from "@/components/ColumnDef";

interface CharacterSpecificTable {
  id: number;
  character: string;
  tableName: string;
  tableType: string;
  createdAt: Date;
  updatedAt: Date;
  headers: string[] | null;
  rows: Record<string, unknown>[] | null;
}

interface CharacterSpecificTableProps {
  data: CharacterSpecificTable[];
}

type TableRow = Record<string, unknown>;

export function CharacterSpecificTable({ data }: CharacterSpecificTableProps) {
  if (!data || data.length === 0 || !data[0].headers) {
    return null;
  }

  // Create columns dynamically based on the headers
  const columns: ColumnDef<TableRow>[] = [
    createColumn<TableRow>({
      accessorKey: "character",
      header: <TableHeader>Character</TableHeader>,
      size: 150,
    }),
    ...data[0].headers.map((header) =>
      createColumn<TableRow>({
        accessorKey: header,
        header: (
          <TableHeader>
            <ColumnHeader
              title={header
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              tooltip={`${header
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")} value`}
            />
          </TableHeader>
        ),
        size: 150,
      })
    ),
  ];

  // Transform the data to include the character field in each row
  const transformedData = data.flatMap((table) =>
    table.rows?.map((row) => ({
      character: table.character,
      ...row,
    })) ?? []
  );

  return <DataTable columns={columns} data={transformedData} />;
} 