"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useHomeProducts } from "@/hooks/useProducts";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import type { ProductHome } from "@/types/productTypes";
import { ProductDetailModal } from "@/components/modals/ProductDetailModal";
import { CURRENCY_SYMBOL } from "@/const/currency";

type ShopSectionProps = {
  t: ReturnType<typeof useTranslations>;
  isMobile: boolean;
};

export default function ShopSection({ t, isMobile }: ShopSectionProps) {
  const { data: products, isLoading } = useHomeProducts();
  const [selectedProduct, setSelectedProduct] = useState<ProductHome | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openProduct = (product: ProductHome) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const hasDiscount = (p: ProductHome) => p.discount && parseFloat(p.discount) > 0;

  return (
    <section id="shop" className="bg-blue-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className={cn("mb-4 font-bold", isMobile ? "text-2xl" : "text-3xl")}>{t("shopSection.title")}</h2>
        <p className="mb-6 text-lg">{t("shopSection.description")}</p>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !products || products.length === 0 ? (
          <p className="mt-10 text-sm text-gray-500">{t("shopSection.noProducts")}</p>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: isMobile ? 1 : 3,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {products.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-full cursor-pointer ps-2 sm:basis-1/2 md:basis-1/3 md:ps-4"
                  >
                    <div
                      onClick={() => openProduct(product)}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="bg-muted flex h-48 w-full items-center justify-center text-gray-400">
                          {t("shopSection.noImage")}
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="mb-1 text-left text-base font-semibold">{product.title}</h3>
                        {product.description && (
                          <p className="text-muted-foreground mb-2 line-clamp-2 text-left text-sm">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-2 pt-2">
                          {hasDiscount(product) ? (
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
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}
      </div>

      <ProductDetailModal open={modalOpen} onOpenChange={setModalOpen} product={selectedProduct} t={t} />
    </section>
  );
}
