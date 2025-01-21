import { Suspense } from "react";
import { fetchSpecialMoves } from "@/app/actions";
import { SpecialMovesTable } from "@/components/SpecialMovesTable";
import { ErrorBoundaryClient } from "@/components/ErrorBoundaryClient";
export { viewport } from "../viewport";

async function SpecialMovesTableContainer() {
  const data = await fetchSpecialMoves();

  if (!data || data.length === 0) {
    return <div className="text-text-secondary">No special moves found</div>;
  }

  return <SpecialMovesTable data={data} />;
}

export default function SpecialMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-bg-secondary mb-8 -mx-4 px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Special Moves</h1>
        <p className="text-xl text-text-secondary">
          Frame data for special moves. Hover over column headers for details.
        </p>
      </div>
      <ErrorBoundaryClient fallback={<div className="text-text-secondary">Error loading special moves</div>}>
        <Suspense fallback={<div className="text-text-secondary">Loading special moves...</div>}>
          <SpecialMovesTableContainer />
        </Suspense>
      </ErrorBoundaryClient>
    </div>
  );
} 