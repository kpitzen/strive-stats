import { Suspense } from "react";
import { fetchNormalMoves } from "@/app/actions";
import { NormalMovesTable } from "@/components/NormalMovesTable";
import { ErrorBoundaryClient } from "@/components/ErrorBoundaryClient";

async function NormalMovesTableContainer() {
  const data = await fetchNormalMoves();

  if (!data || data.length === 0) {
    return <div className="text-text-secondary">No normal moves found</div>;
  }

  return <NormalMovesTable data={data} />;
}

export default function NormalMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-bg-secondary mb-8 -mx-4 px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Normal Moves</h1>
        <p className="text-xl text-text-secondary">
          Frame data for normal moves. Hover over column headers for details.
        </p>
      </div>
      <ErrorBoundaryClient fallback={<div className="text-text-secondary">Error loading normal moves</div>}>
        <Suspense fallback={<div className="text-text-secondary">Loading normal moves...</div>}>
          <NormalMovesTableContainer />
        </Suspense>
      </ErrorBoundaryClient>
    </div>
  );
} 