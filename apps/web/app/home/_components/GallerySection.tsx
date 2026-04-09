/* eslint-disable react-hooks/exhaustive-deps*/
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { HOME_MAKET } from "@/const/homeMaket";
import { cn } from "@/lib/utils";

const images = [
  "/gallery-1.png",
  "/gallery-2.jpeg",
  "/gallery-3.png",
  "/gallery-4.png",
  "/gallery-5.png",
  "/gallery-6.png",
  "/gallery-7.png",
  "/gallery-8.png",
  "/gallery-9.jpeg",
];

export default function GallerySection({ isMobile }: { isMobile: boolean }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className={cn("bg-linear-to-r from-pink-50 via-white to-rose-50", HOME_MAKET.section_py)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: isMobile ? 1 : 3,
          }}
          setApi={setApi}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {images.map((src, i) => (
              <CarouselItem key={i} className="basis-full pl-2 md:basis-1/3 md:pl-4">
                <div className="group relative aspect-4/3 overflow-hidden rounded-2xl">
                  <Image
                    src={src}
                    alt={`Nail salon gallery ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-pink-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({
            length: isMobile ? images.length : Math.ceil(images.length / 3),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index * (isMobile ? 1 : 3))}
              className={`h-2 w-2 rounded-full transition-all ${
                index === current ? "w-4 bg-rose-500" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
