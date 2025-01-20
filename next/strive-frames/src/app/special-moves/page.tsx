import { db, specialMoves } from "@/db";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ColumnHeader } from "@/components/ColumnHeader";

interface SpecialMoves {
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
}

const columns: ColumnDef<SpecialMoves>[] = [
  {
    accessorKey: "character",
    header: "Character",
    size: 150,
  },
  {
    accessorKey: "name",
    header: <ColumnHeader title="Name" tooltip="Name of the special move" />,
    size: 200,
  },
  {
    accessorKey: "input",
    header: <ColumnHeader title="Input" tooltip="Command input for the move" />,
    size: 150,
  },
  {
    accessorKey: "damage",
    header: <ColumnHeader title="Damage" tooltip="Base damage of the move" />,
    size: 100,
  },
  {
    accessorKey: "guard",
    header: <ColumnHeader title="Guard" tooltip="Guard type (All, High, Low)" />,
    size: 100,
  },
  {
    accessorKey: "startup",
    header: <ColumnHeader title="Startup" tooltip="Startup frames" />,
    size: 100,
  },
  {
    accessorKey: "active",
    header: <ColumnHeader title="Active" tooltip="Active frames" />,
    size: 100,
  },
  {
    accessorKey: "recovery",
    header: <ColumnHeader title="Recovery" tooltip="Recovery frames" />,
    size: 100,
  },
  {
    accessorKey: "onBlock",
    header: <ColumnHeader title="On Block" tooltip="Frame advantage on block" />,
    size: 100,
  },
  {
    accessorKey: "onHit",
    header: <ColumnHeader title="On Hit" tooltip="Frame advantage on hit" />,
    size: 100,
  },
  {
    accessorKey: "level",
    header: <ColumnHeader title="Level" tooltip="Attack level" />,
    size: 100,
  },
  {
    accessorKey: "counterType",
    header: <ColumnHeader title="Counter" tooltip="Counter hit type" />,
    size: 100,
  },
  {
    accessorKey: "invuln",
    header: <ColumnHeader title="Invuln" tooltip="Invulnerability frames" />,
    size: 100,
  },
  {
    accessorKey: "proration",
    header: <ColumnHeader title="Proration" tooltip="Damage proration" />,
    size: 100,
  },
  {
    accessorKey: "riscGain",
    header: <ColumnHeader title="RISC+" tooltip="RISC gain on block" />,
    size: 100,
  },
  {
    accessorKey: "riscLoss",
    header: <ColumnHeader title="RISC-" tooltip="RISC loss on hit" />,
    size: 100,
  },
];

async function fetchSpecialMoves() {
  "use server";
  
  try {
    return await db.select().from(specialMoves);
  } catch (error) {
    console.error("Failed to fetch special moves:", error);
    throw error;
  }
}

async function SpecialMovesTable() {
  try {
    const data = await fetchSpecialMoves();
    
    if (!data.length) {
      return (
        <div className="text-center py-4">
          No special moves data found.
        </div>
      );
    }
    
    return <DataTable columns={columns} data={data} />;
  } catch (error) {
    console.error("Error loading special moves:", error);
    return (
      <div className="text-red-500 py-4">
        Error loading special moves. Please check your database connection.
      </div>
    );
  }
}

export default function SpecialMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Special Moves</h1>
      <p className="text-lg text-gray-600 mb-6">
        Frame data for each character's special moves. Hover over column headers for details.
      </p>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading special moves...</div>}>
          <SpecialMovesTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 