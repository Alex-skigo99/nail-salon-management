"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import ClientNav, { ClientTab } from "./_components/ClientNav";
import ActiveAppointments from "./_components/ActiveAppointments";
import HistoryPage from "./_components/HistoryPage";
import ProfilePage from "./_components/ProfilePage";
import FeedbackPage from "./_components/FeedbackPage";

export default function ClientPage() {
  const [activeTab, setActiveTab] = useState<ClientTab>("appointments");
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleTabChange = (tab: ClientTab) => {
    if (tab === "back") {
      router.push("/home");
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <ClientNav activeTab={activeTab} onTabChange={handleTabChange} isMobile={isMobile} />
      <div className="mt-6">
        {activeTab === "appointments" && <ActiveAppointments isMobile={isMobile} />}
        {activeTab === "history" && <HistoryPage isMobile={isMobile} />}
        {activeTab === "profile" && <ProfilePage />}
        {activeTab === "feedback" && <FeedbackPage />}
      </div>
    </div>
  );
}
