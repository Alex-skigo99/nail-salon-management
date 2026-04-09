"use client";

import { useTranslations } from "next-intl";
import type { ProductHome } from "@/types/productTypes";
import { CURRENCY_SYMBOL } from "@/const/currency";
import { TruncatedText } from "@/components/elements/TruncatedText";

type ProductCarouselCardProps = {
  product: ProductHome;
  onSelect: (product: ProductHome) => void;
};

export function ProductCarouselCard({ product, onSelect }: ProductCarouselCardProps) {
  const t = useTranslations();
  const hasDiscount = product.discount && parseFloat(product.discount) > 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.title}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="bg-muted flex aspect-square w-full items-center justify-center text-gray-400">
          {t("shopSection.noImage")}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between">
          <h3 className="mb-1 text-start font-semibold">{product.title}</h3>
          <div className="flex flex-col items-center gap-0">
            {hasDiscount ? (
              <>
                <span className="text-muted-foreground text-sm line-through">
                  {CURRENCY_SYMBOL}
                  {product.price}
                </span>
                <span className="font-bold text-green-600">
                  {CURRENCY_SYMBOL}
                  {product.discount}
                </span>
              </>
            ) : (
              <span className="font-bold">
                {CURRENCY_SYMBOL}
                {product.price}
              </span>
            )}
            {!product.is_available && (
              <span className="ml-auto text-xs text-red-500">{t("shopSection.outOfStock")}</span>
            )}
          </div>
        </div>
        {product.description && (
          <TruncatedText
            className="text-muted-foreground mb-2 line-clamp-2 text-left text-sm"
            text={product.description}
            maxWidth="max-w-full"
            minSymbolsForTooltip={30}
          />
        )}
      </div>
    </div>
  );
}
