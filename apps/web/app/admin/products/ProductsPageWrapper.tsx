"use client";

import dynamic from "next/dynamic";

const ProductsPage = dynamic(() => import("./ProductsPage"), { ssr: false });

export default function ProductsPageWrapper() {
  return <ProductsPage />;
}
