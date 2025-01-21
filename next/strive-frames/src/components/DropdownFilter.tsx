import { Column } from "@tanstack/react-table";
import { useCallback } from "react";
import { MultiSelect, Option } from "@/components/ui/multi-select";

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
    (selectedOptions: Option[]) => {
      if (selectedOptions.length === 0) {
        column.setFilterValue(undefined);
      } else {
        column.setFilterValue(selectedOptions.map(o => o.value));
      }
    },
    [column]
  );

  const isMultiSelect = column.id === "character" || column.id === "input";

  if (isMultiSelect) {
    const mappedOptions = options.map(option => ({
      label: option,
      value: option,
    }));

    const selectedValues = (column.getFilterValue() as string[] | undefined) || [];
    const selectedOptions = mappedOptions.filter(option => 
      selectedValues.includes(option.value)
    );

    return (
      <MultiSelect
        options={mappedOptions}
        selected={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
      />
    );
  }

  return (
    <select
      id={column.id}
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value === "" ? undefined : e.target.value)}
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