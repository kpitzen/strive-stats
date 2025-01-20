import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SystemJumpTable } from "@/components/SystemJumpTable";
import { fetchSystemJumpData } from "@/app/actions";

async function SystemJumpTableContainer() {
  try {
    const data = await fetchSystemJumpData();
    
    if (!data.length) {
      return (
        <div className="text-center py-4">
          No system jump data found.
        </div>
      );
    }
    
    return <SystemJumpTable data={data} />;
  } catch (error) {
    console.error("Error loading system jump data:", error);
    return (
      <div className="text-red-500 py-4">
        Error loading system jump data. Please check your database connection.
      </div>
    );
  }
}

export default function JumpDataPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Jump Data</h1>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading jump data...</div>}>
          <SystemJumpTableContainer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 