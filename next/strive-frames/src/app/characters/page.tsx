"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { fetchCharacters } from "@/app/actions";
import { CharactersTable } from "@/components/CharactersTable";

async function CharactersTableContainer() {
  const data = await fetchCharacters();

  if (!data || data.length === 0) {
    return <div>No characters found</div>;
  }

  return <CharactersTable data={data} />;
}

export default function CharactersPage() {
  return (
    <div className="container mx-auto py-10">
      <ErrorBoundary fallback={<div>Error loading characters</div>}>
        <Suspense fallback={<div>Loading characters...</div>}>
          <CharactersTableContainer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 