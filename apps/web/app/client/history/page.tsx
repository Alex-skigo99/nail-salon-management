"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import HistoryPage from "../_components/HistoryPage";

export default function HistoryRoute() {
  const isMobile = useIsMobile();
  return <HistoryPage isMobile={isMobile} />;
}
