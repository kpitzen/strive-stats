"use client";

import { ErrorBoundary } from "react-error-boundary";

interface ErrorBoundaryClientProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function ErrorBoundaryClient({ children, fallback }: ErrorBoundaryClientProps) {
  return <ErrorBoundary fallback={<>{fallback}</>}>{children}</ErrorBoundary>;
} 