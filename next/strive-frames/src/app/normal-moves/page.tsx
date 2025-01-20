import { Suspense } from "react";
import { fetchNormalMoves } from "@/app/actions";
import { NormalMovesTable } from "@/components/NormalMovesTable";
import { ErrorBoundaryClient } from "@/components/ErrorBoundaryClient";

async function NormalMovesTableContainer() {
  const data = await fetchNormalMoves();

  if (!data || data.length === 0) {
    return <div>No normal moves found</div>;
  }

  return <NormalMovesTable data={data} />;
}

export default function NormalMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Normal Moves</h1>
      <p className="text-lg text-gray-600 mb-6">
        Frame data for normal moves. Hover over column headers for details.
      </p>
      <ErrorBoundaryClient fallback={<div>Error loading normal moves</div>}>
        <Suspense fallback={<div>Loading normal moves...</div>}>
          <NormalMovesTableContainer />
        </Suspense>
      </ErrorBoundaryClient>
    </div>
  );
} 