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
  const mappedOptions = options.map(option => ({
    label: option,
    value: option,
  }));

  if (isMultiSelect) {
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
        isMulti={true}
      />
    );
  }

  const currentValue = (column.getFilterValue() as string) ?? "";
  const selectedOptions = currentValue ? [mappedOptions.find(opt => opt.value === currentValue)!] : [];

  return (
    <MultiSelect
      options={mappedOptions}
      selected={selectedOptions}
      onChange={(selected) => {
        if (selected.length === 0) {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(selected[selected.length - 1].value);
        }
      }}
      placeholder={placeholder}
      isMulti={false}
    />
  );
} 