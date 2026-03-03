"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = { isMobile: boolean };

export default function GallerySection({ isMobile }: Props) {
  const images = ["/Nail-Salons-2.jpeg", "/Nail-Salons-3.jpeg", "/Nail-Salons-4.jpeg"];

  return (
    <section className="bg-linear-to-r from-pink-50 via-white to-rose-50 py-2">
      <div className={`mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {images.map((src, i) => (
          <div key={i} className="group relative aspect-4/3 overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt={`Nail salon gallery ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-pink-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
