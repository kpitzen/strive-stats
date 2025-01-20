"use client";

interface ColumnHeaderProps {
  title: string;
  tooltip: string;
}

export function ColumnHeader({ title, tooltip }: ColumnHeaderProps) {
  return (
    <div className="group relative">
      {title}
      <span className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
        {tooltip}
      </span>
    </div>
  );
} 