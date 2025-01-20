import { Column } from "@tanstack/react-table";

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
  return (
    <select
      id={column.id}
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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