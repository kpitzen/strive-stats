"use client";

interface ArrayCellProps {
  value: string[] | null;
}

export function ArrayCell({ value }: ArrayCellProps) {
  if (!value || value.length === 0) {
    return <span className="text-gray-500">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {value.map((item, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-900 text-xs font-medium border border-gray-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
} 