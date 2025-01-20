import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SystemCoreTable } from "@/components/SystemCoreTable";
import { fetchSystemCoreData } from "@/app/actions";

async function SystemCoreTableContainer() {
  try {
    const data = await fetchSystemCoreData();
    
    if (!data.length) {
      return (
        <div className="text-center py-4">
          No system core data found.
        </div>
      );
    }
    
    return <SystemCoreTable data={data} />;
  } catch (error) {
    console.error("Error loading system core data:", error);
    return (
      <div className="text-red-500 py-4">
        Error loading system core data. Please check your database connection.
      </div>
    );
  }
}

export default function SystemCorePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">System Core Data</h1>
      <p className="text-lg text-gray-600 mb-6">
        Core system mechanics and character-specific stats. Hover over column headers for details.
      </p>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading system core data...</div>}>
          <SystemCoreTableContainer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 