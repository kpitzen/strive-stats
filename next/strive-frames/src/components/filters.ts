// Custom filter function for level field
export const levelFilterFn = (
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string
): boolean => {
  const value = row.getValue(columnId);
  if (!value || !filterValue) return true;
  return value.toString().includes(filterValue.toString());
};

// Multi-select filter function
export const multiSelectFilterFn = (
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string[]
): boolean => {
  const value = row.getValue(columnId);
  if (!value || !filterValue || filterValue.length === 0) return true;

  // For input column, check if any selected value is a prefix of the cell value
  if (columnId === "input") {
    return filterValue.some((filter) => value.toString().startsWith(filter));
  }

  // For other columns (like character), use exact match
  return filterValue.includes(value.toString());
};
