import { Suspense } from "react";
import { fetchSpecialMoves } from "@/app/actions";
import { SpecialMovesTable } from "@/components/SpecialMovesTable";
import { ErrorBoundaryClient } from "@/components/ErrorBoundaryClient";

async function SpecialMovesTableContainer() {
  const data = await fetchSpecialMoves();

  if (!data || data.length === 0) {
    return <div>No special moves found</div>;
  }

  return <SpecialMovesTable data={data} />;
}

export default function SpecialMovesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Special Moves</h1>
      <p className="text-lg text-gray-600 mb-6">
        Frame data for special moves. Hover over column headers for details.
      </p>
      <ErrorBoundaryClient fallback={<div>Error loading special moves</div>}>
        <Suspense fallback={<div>Loading special moves...</div>}>
          <SpecialMovesTableContainer />
        </Suspense>
      </ErrorBoundaryClient>
    </div>
  );
} 