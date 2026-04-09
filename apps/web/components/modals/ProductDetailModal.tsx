"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ProductHome } from "@/types/productTypes";
import { useTranslations } from "next-intl";
import { CURRENCY_SYMBOL } from "@/const/currency";

type ProductDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductHome | null;
  t: ReturnType<typeof useTranslations>;
};

export function ProductDetailModal({ open, onOpenChange, product, t }: ProductDetailModalProps) {
  if (!product) return null;

  const hasDiscount = product.discount && parseFloat(product.discount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {product.image ? (
            <img src={product.image} alt={product.title} className="aspect-square w-full rounded-lg object-cover" />
          ) : (
            <div className="bg-muted flex aspect-square w-full items-center justify-center rounded-lg text-gray-400">
              {t("shopSection.noImage")}
            </div>
          )}

          {product.description && <p className="text-muted-foreground text-sm">{product.description}</p>}

          <div className="flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-muted-foreground text-lg line-through">
                  {CURRENCY_SYMBOL}
                  {product.price}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {CURRENCY_SYMBOL}
                  {product.discount}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">
                {CURRENCY_SYMBOL}
                {product.price}
              </span>
            )}
          </div>

          {!product.is_available && (
            <Badge variant="destructive" className="w-fit">
              {t("shopSection.outOfStock")}
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
