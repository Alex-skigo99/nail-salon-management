"use client";

import dynamic from "next/dynamic";

const AppointmentsPage = dynamic(() => import("./AppointmentsPage"), { ssr: false });

export default function AppointmentsPageWrapper() {
  return <AppointmentsPage />;
}
