"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import ActiveAppointments from "../_components/ActiveAppointments";

export default function AppointmentsPage() {
  const isMobile = useIsMobile();
  return <ActiveAppointments isMobile={isMobile} />;
}
