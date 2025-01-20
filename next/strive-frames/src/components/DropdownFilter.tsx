import { Column } from "@tanstack/react-table";
import { useCallback } from "react";

interface DropdownFilterProps<T> {
  column: Column<T>;
  options: string[];
  placeholder: string;
}

export function DropdownFilter<T>({
  column,
  options,
  placeholder,
}: DropdownFilterProps<T>) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      column.setFilterValue(value === "" ? undefined : value);
    },
    [column]
  );

  return (
    <select
      id={column.id}
      value={(column.getFilterValue() as string) ?? ""}
      onChange={handleChange}
      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="" className="text-gray-500">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option} className="text-gray-900">
          {option}
        </option>
      ))}
    </select>
  );
} 