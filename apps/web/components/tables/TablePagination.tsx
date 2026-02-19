import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGINATION_PAGE_SIZES = [5, 10, 20, 50];

interface TablePaginationProps<TData> {
  table: Table<TData>;
  isPaginationNeeded?: boolean;
  totalItems: number;
  nextPageToken?: string | null;
}

export function TablePagination<TData>({
  table,
  isPaginationNeeded = false,
  totalItems,
  nextPageToken,
}: TablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 640 : false;

  return (
    <div className="flex w-full items-center justify-between py-4">
      <div className="text-sm text-gray-700">
        {totalItems > 0 && !isMobile
          ? `Showing ${startItem} to ${endItem} of ${totalItems} ${totalItems === 1 ? "entry" : "entries"}`
          : null}
        {totalItems > 0 && isMobile ? `${startItem} to ${endItem} of ${totalItems}` : null}
      </div>

      <div className="flex items-center space-x-4">
        {totalItems > 0 && (
          <div className="flex items-center gap-2">
            <p className="text-xs">
              {!isMobile && <span>Rows </span>}
              per page:
            </p>
            <Select value={pageSize.toString()} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                {PAGINATION_PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()} className="cursor-pointer">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isPaginationNeeded && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
