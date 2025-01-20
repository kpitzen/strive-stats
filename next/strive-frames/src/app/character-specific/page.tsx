"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { fetchCharacterSpecificTables } from "@/app/actions";
import { CharacterSpecificTable } from "@/components/CharacterSpecificTable";

async function CharacterSpecificTableContainer() {
  const data = await fetchCharacterSpecificTables();

  if (!data || data.length === 0) {
    return <div>No character-specific tables found</div>;
  }

  return <CharacterSpecificTable data={data} />;
}

export default function CharacterSpecificPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Character-Specific Data</h1>
      <p className="text-lg text-gray-600 mb-6">
        Character-specific mechanics and data tables. Hover over column headers for details.
      </p>
      <ErrorBoundary fallback={<div>Error loading character-specific data</div>}>
        <Suspense fallback={<div>Loading character-specific data...</div>}>
          <CharacterSpecificTableContainer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 