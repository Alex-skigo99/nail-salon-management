import { PaginationState, Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const PAGINATION_PAGE_SIZES = [5, 10, 20, 50];

interface TablePaginationProps<TData> {
  table: Table<TData>;
  isPaginationNeeded?: boolean;
  totalItems: number;
  nextPageToken?: string | null;
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
}

export function TablePagination<TData>({
  table,
  isPaginationNeeded = false,
  totalItems,
  nextPageToken,
  pagination: controlledPagination,
  setPagination,
}: TablePaginationProps<TData>) {
  const isMobile = useIsMobile();
  const { pageIndex, pageSize } = controlledPagination ?? table.getState().pagination;
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  const lastPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < lastPage;

  const prevButtonTitle = isMobile ? "Prev" : "Previous";
  const nextButtonTitle = isMobile ? "Next" : "Next";

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
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                const newSize = Number(value);
                if (setPagination) {
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: newSize,
                    pageIndex: 0,
                  }));
                } else {
                  table.setPageSize(newSize);
                }
              }}
            >
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
              onClick={() => {
                if (setPagination) {
                  setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
                } else {
                  table.previousPage();
                }
              }}
              disabled={!canPreviousPage}
            >
              {prevButtonTitle}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (setPagination) {
                  setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
                } else {
                  table.nextPage();
                }
              }}
              disabled={!canNextPage && !nextPageToken}
            >
              {nextButtonTitle}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
