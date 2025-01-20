import { Suspense } from "react";
import { fetchOverdriveMoves } from "@/app/actions";
import { OverdriveMovesTable } from "@/components/OverdriveMovesTable";
import { ErrorBoundaryClient } from "@/components/ErrorBoundaryClient";

async function OverdriveMovesTableContainer() {
  const data = await fetchOverdriveMoves();

  if (!data || data.length === 0) {
    return <div>No overdrive moves found</div>;
  }

  return <OverdriveMovesTable data={data} />;
}

export default function OverdriveMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Overdrive Moves</h1>
      <p className="text-lg text-gray-600 mb-6">
        Frame data for overdrive moves. Hover over column headers for details.
      </p>
      <ErrorBoundaryClient fallback={<div>Error loading overdrive moves</div>}>
        <Suspense fallback={<div>Loading overdrive moves...</div>}>
          <OverdriveMovesTableContainer />
        </Suspense>
      </ErrorBoundaryClient>
    </div>
  );
} 