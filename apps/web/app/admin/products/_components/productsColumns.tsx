"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { Product, ProductType } from "@/types/productTypes";
import { CURRENCY_SYMBOL } from "@/const/currency";
import { getCreatedAtString } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<ProductType, string> = {
  nail_care: "Nail Care",
  tools: "Tools",
  accessories: "Accessories",
  other: "Other",
};

export function productsColumns(): ColumnDef<Product, unknown>[] {
  return [
    {
      id: "image",
      header: "",
      size: 50,
      cell: ({ row }) => {
        const product = row.original;
        return product.image ? (
          <img src={product.image} alt={product.title} className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md text-xs text-gray-400">—</div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      size: 180,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <span className="text-sm font-medium" title={product.description ?? ""}>
            {product.title}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 110,
      cell: ({ getValue }) => {
        const type = getValue() as ProductType;
        return (
          <Badge variant="secondary" className="text-xs">
            {TYPE_LABELS[type] ?? type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      size: 100,
      cell: ({ row }) => {
        const product = row.original;
        const discount = product.discount && parseFloat(product.discount) > 0 ? product.discount : null;
        return (
          <div className="flex flex-col">
            {discount ? (
              <>
                <span className="text-muted-foreground text-xs line-through">
                  {CURRENCY_SYMBOL}
                  {product.price}
                </span>
                <span className="font-medium text-green-600">
                  {CURRENCY_SYMBOL}
                  {discount}
                </span>
              </>
            ) : (
              <span className="font-medium">
                {CURRENCY_SYMBOL}
                {product.price}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      size: 60,
    },
    {
      accessorKey: "is_available",
      header: "Available",
      size: 90,
      cell: ({ getValue }) => {
        const available = getValue() as boolean;
        return (
          <div className={cn("font-semibold", available ? "text-green-600" : "text-red-600")}>
            {available ? "Yes" : "No"}
          </div>
        );
      },
    },
    {
      accessorKey: "is_home_display",
      header: "Home",
      size: 60,
      cell: ({ getValue }) => {
        const display = getValue() as boolean;
        return display ? <Check className="text-primary h-4 w-4" /> : <span className="text-gray-300">—</span>;
      },
    },
    {
      accessorKey: "home_sorting",
      header: "Home Sort",
      size: 80,
      cell: ({ getValue }) => {
        const sorting = getValue() as number;
        return sorting !== null && sorting !== undefined ? (
          <span className="text-sm">{sorting}</span>
        ) : (
          <span className="text-gray-300">—</span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      size: 100,
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return <span className="text-xs">{getCreatedAtString(val)}</span>;
      },
    },
  ];
}
