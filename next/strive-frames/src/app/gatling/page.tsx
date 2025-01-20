import { db, gatlingTables } from "@/db";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
  {
    accessorKey: "character",
    header: "Character",
    size: 150,
  },
  {
    accessorKey: "pMoves",
    header: (
      <div className="group relative">
        P → Moves
        <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
          Moves that can be gatling'd into from P
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "kMoves",
    header: (
      <div className="group relative">
        K → Moves
        <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
          Moves that can be gatling'd into from K
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "sMoves",
    header: (
      <div className="group relative">
        S → Moves
        <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
          Moves that can be gatling'd into from S
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "hMoves",
    header: (
      <div className="group relative">
        H → Moves
        <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
          Moves that can be gatling'd into from H
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "dMoves",
    header: (
      <div className="group relative">
        D → Moves
        <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
          Moves that can be gatling'd into from D
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "cancelOptions",
    header: (
      <div className="group relative">
        Special Cancels
        <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
          Special move cancel options
        </span>
      </div>
    ),
    size: 250,
  },
];

async function fetchGatlingData() {
  "use server";
  
  try {
    return await db.select().from(gatlingTables);
  } catch (error) {
    console.error("Failed to fetch gatling data:", error);
    throw error;
  }
}

async function GatlingTable() {
  try {
    const data = await fetchGatlingData();
    
    if (!data.length) {
      return (
        <div className="text-center py-4">
          No gatling data found.
        </div>
      );
    }
    
    return <DataTable columns={columns} data={data} />;
  } catch (error) {
    console.error("Error loading gatling data:", error);
    return (
      <div className="text-red-500 py-4">
        Error loading gatling data. Please check your database connection.
      </div>
    );
  }
}

export default function GatlingPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Gatling Tables</h1>
      <p className="text-lg text-gray-600 mb-6">
        Gatling combo possibilities for each character. Shows which moves can be chained after each attack. Hover over column headers for details.
      </p>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading gatling data...</div>}>
          <GatlingTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 