import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebars/AppSidebar";

type Props = {
  children: ReactNode;
};

export default async function RootLayout({ children }: Readonly<Props>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
