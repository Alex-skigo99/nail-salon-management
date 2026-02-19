import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StringKeys } from "@/types/generalTypes";
import { getTableOptionsConfig } from "@/utils/getTableOptionsConfig";
import { ColumnDef, flexRender, PaginationState, Row, RowSelectionState, useReactTable } from "@tanstack/react-table";
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { TablePagination } from "./TablePagination";

type tGeneralTable<TState, TData extends TState, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPending: boolean;
  customNoResultsMessage?: string;
  handleRowClick?: (row: Row<any>) => void;
  headerClass?: string;
  cellClass?: string;
  rowSelection?: RowSelectionState;
  setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  rowIdField?: StringKeys<TData>;
  isPaginationNeeded?: boolean;
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalRows?: number;
  getRowClassName?: (row: TData) => string;
  isRowDisabled?: (row: TData) => boolean | undefined;
  nextPageToken?: string | null;
};

export default function GeneralTable<TState, TData extends TState, TValue>({
  columns,
  data,
  isPending,
  customNoResultsMessage,
  handleRowClick,
  headerClass,
  cellClass,
  rowSelection,
  setRowSelection,
  rowIdField,
  isPaginationNeeded = false,
  pagination = { pageIndex: 0, pageSize: 10 },
  setPagination,
  totalRows,
  getRowClassName,
  isRowDisabled,
  nextPageToken,
}: tGeneralTable<TState, TData, TValue>) {
  const tableOptions = React.useMemo(
    () =>
      getTableOptionsConfig({
        data,
        columns,
        rowSelection,
        setRowSelection,
        rowIdField,
        isPaginationNeeded,
        pagination,
        setPagination,
        totalRows,
      }),
    [data, columns, rowSelection, setRowSelection, rowIdField, isPaginationNeeded, pagination, setPagination, totalRows]
  );

  const table = useReactTable(tableOptions);

  return (
    <div className={cn("flex flex-col")} dir="ltr">
      <div className="max-h-[calc(100vh-200px)] overflow-auto">
        <Table className="table-fixed border-collapse bg-white">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-2",
                      headerClass,
                      (header.column.columnDef.meta as any)?.columnClass ?? "",
                      (header.column.columnDef.meta as any)?.headerClass ?? ""
                    )}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const disabled = isRowDisabled?.(row.original) ?? false;
                    const customRowClass = getRowClassName?.(row.original) ?? "";

                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          handleRowClick && !disabled ? "cursor-pointer" : "",
                          disabled ? "cursor-not-allowed" : "",
                          customRowClass
                        )}
                        onClick={() => {
                          if (handleRowClick && !disabled) {
                            handleRowClick(row);
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "border-r px-2 py-2 whitespace-normal last:border-r-0",
                              cellClass,
                              (cell.column.columnDef.meta as any)?.columnClass ?? "",
                              (cell.column.columnDef.meta as any)?.cellClass ?? ""
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {customNoResultsMessage || "No Results"}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        table={table}
        isPaginationNeeded={isPaginationNeeded}
        totalItems={totalRows ?? 0}
        nextPageToken={nextPageToken}
      />
    </div>
  );
}
