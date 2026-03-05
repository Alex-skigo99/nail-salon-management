"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebars/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Readonly<Props>) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      {isMobile ? (
        <div className="flex h-screen w-full flex-col">
          <AppSidebar />
          <div className="flex-1">{children}</div>
        </div>
      ) : (
        <>
          <AppSidebar />
          {children}
        </>
      )}
    </SidebarProvider>
  );
}
