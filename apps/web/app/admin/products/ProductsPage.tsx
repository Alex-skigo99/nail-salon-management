"use client";

import { useState, useCallback } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useProducts } from "@/hooks/useProducts";
import type { UseProductsParams } from "@/hooks/useProducts";
import type { Product } from "@/types/productTypes";
import GeneralTable from "@/components/tables/GeneralTable";
import { productsColumns } from "./_components/productsColumns";
import { ProductsSearchFilterSection } from "./_components/ProductsSearchFilterSection";
import { ProductCreateUpdateDialog } from "@/components/modals/productCreateUpdateDialog/ProductCreateUpdateDialog";
import type { Row, PaginationState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProductsPage() {
  const [filterParams, setFilterParams] = useState<UseProductsParams>({ sort: "created_desc" });
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleFilterChange = useCallback((params: UseProductsParams) => {
    setFilterParams(params);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const { data, isLoading, error } = useProducts(
    { ...filterParams, page: pagination.pageIndex + 1, perPage: pagination.pageSize },
    !!session?.user?.id
  );
  const products = data?.data ?? [];
  const paginationData = data?.pagination;

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const handleRowClick = useCallback((row: Row<Product>) => {
    setSelectedProductId(row.original.id);
    setFormDialogOpen(true);
  }, []);

  const handleAddProduct = useCallback(() => {
    setSelectedProductId(null);
    setFormDialogOpen(true);
  }, []);

  const columns = productsColumns();

  return (
    <div className={cn("flex flex-1 flex-col", { "overflow-hidden": !isMobile })}>
      <div className={cn("border-b px-6 py-5", { "border-b-0 py-2": isMobile })}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Products</h1>
              {!isMobile && <p className="text-muted-foreground text-sm">Manage your shop products</p>}
            </div>
          </div>
          <Button onClick={handleAddProduct} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className={cn("flex-1 p-6", { "px-0 py-2": isMobile })}>
        <ProductsSearchFilterSection params={filterParams} onChange={handleFilterChange} />

        {error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-destructive font-medium">Failed to load products</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        ) : (
          <GeneralTable<Product, Product, unknown>
            columns={columns}
            data={products}
            isPending={isLoading}
            handleRowClick={handleRowClick}
            customNoResultsMessage="No products found"
            isPaginationNeeded
            pagination={pagination}
            setPagination={setPagination}
            totalRows={paginationData?.total ?? 0}
          />
        )}
      </div>

      <ProductCreateUpdateDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} productId={selectedProductId} />
    </div>
  );
}
