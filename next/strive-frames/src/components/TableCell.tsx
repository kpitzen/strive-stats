"use client";

interface TableCellProps {
  value: unknown;
  fallback?: string;
}

export function TableCell({ value, fallback = "-" }: TableCellProps) {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
} 