import { Suspense } from "react";
import { fetchOverdriveMoves } from "@/app/actions";
import { OverdriveMovesTable } from "@/components/OverdriveMovesTable";
import { ErrorBoundaryClient } from "@/components/ErrorBoundaryClient";
export { viewport } from "../viewport";

async function OverdriveMovesTableContainer() {
  const data = await fetchOverdriveMoves();

  if (!data || data.length === 0) {
    return <div className="text-text-secondary">No overdrive moves found</div>;
  }

  return <OverdriveMovesTable data={data} />;
}

export default function OverdriveMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-bg-secondary mb-8 -mx-4 px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Overdrive Moves</h1>
        <p className="text-xl text-text-secondary">
          Frame data for overdrive moves. Hover over column headers for details.
        </p>
      </div>
      <ErrorBoundaryClient fallback={<div className="text-text-secondary">Error loading overdrive moves</div>}>
        <Suspense fallback={<div className="text-text-secondary">Loading overdrive moves...</div>}>
          <OverdriveMovesTableContainer />
        </Suspense>
      </ErrorBoundaryClient>
    </div>
  );
} 