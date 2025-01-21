export declare function levelFilterFn(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string
): boolean;

export declare function multiSelectFilterFn(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string[]
): boolean;
