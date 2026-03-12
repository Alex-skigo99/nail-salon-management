"use client";

import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";

import Header from "./_components/Header";
import HeroSection from "./_components/HeroSection";
import AboutSection from "./_components/AboutSection";
import GallerySection from "./_components/GallerySection";
import PricesSection from "./_components/PricesSection";
import ScheduleSection from "./_components/ScheduleSection";
import ShopSection from "./_components/ShopSection";
import MapSection from "./_components/MapSection";
import Footer from "./_components/Footer";

type HomeProps = {
  t: ReturnType<typeof useTranslations>;
};

export default function Home({ t }: HomeProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <Header t={t} isMobile={isMobile} />
      <HeroSection t={t} isMobile={isMobile} />
      <AboutSection t={t} isMobile={isMobile} />
      <GallerySection isMobile={isMobile} />
      <PricesSection t={t} isMobile={isMobile} />
      <ScheduleSection t={t} isMobile={isMobile} />
      <ShopSection t={t} isMobile={isMobile} />
      <MapSection t={t} isMobile={isMobile} />
      <Footer t={t} isMobile={isMobile} />
    </div>
  );
}
