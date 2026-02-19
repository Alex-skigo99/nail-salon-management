import { StringKeys } from "@/types/generalTypes";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  RowSelectionState,
  TableOptions,
  TableState,
} from "@tanstack/react-table";

type tGetTableOptionsConfig<TState, TData extends TState, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  rowSelection?: RowSelectionState;
  setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  rowIdField?: StringKeys<TData>;
  isPaginationNeeded?: boolean;
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalRows?: number;
};

export function getTableOptionsConfig<TState, TData extends TState, TValue>({
  data,
  columns,
  rowSelection,
  setRowSelection,
  rowIdField,
  isPaginationNeeded = false,
  pagination = { pageIndex: 0, pageSize: 10 },
  setPagination,
  totalRows,
}: tGetTableOptionsConfig<TState, TData, TValue>): TableOptions<TData> {
  const reactTableConfig: TableOptions<TData> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  };

  const state: Partial<TableState> = {};

  if (isPaginationNeeded) {
    reactTableConfig.manualPagination = true;

    if (setPagination) {
      reactTableConfig.onPaginationChange = setPagination;
      state.pagination = pagination;
      reactTableConfig.rowCount = totalRows;
    }

    reactTableConfig.autoResetPageIndex = false;
  }

  if (rowSelection && setRowSelection) {
    reactTableConfig.onRowSelectionChange = setRowSelection;
    state.rowSelection = rowSelection;
  }

  if (rowIdField) {
    reactTableConfig.getRowId = (row) => String(row[rowIdField]);
  }

  if (Object.keys(state).length > 0) {
    reactTableConfig.state = state;
  }

  return reactTableConfig;
}
