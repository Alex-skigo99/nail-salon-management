"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useHomeProducts } from "@/hooks/useProducts";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import type { ProductHome } from "@/types/productTypes";
import { ProductDetailModal } from "@/components/modals/ProductDetailModal";
import { ProductCarouselCard } from "./ProductCarouselCard";
import { HOME_MAKET } from "@/const/homeMaket";

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

  return (
    <section id="shop" className={cn("bg-blue-50", HOME_MAKET.section_py)}>
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
                slidesToScroll: isMobile ? 1 : 4,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {products.map((product) => (
                  <CarouselItem key={product.id} className="basis-full ps-2 sm:basis-1/2 md:basis-1/4 md:ps-4">
                    <ProductCarouselCard product={product} onSelect={openProduct} />
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
