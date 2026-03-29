"use client";

import dynamic from "next/dynamic";

const ClientsPage = dynamic(() => import("./ClientsPage"), { ssr: false });

export default function ClientsPageWrapper() {
  return <ClientsPage />;
}
