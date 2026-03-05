"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LayoutDashboard, Users, Menu, Scissors, HomeIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isRTLLocale } from "@/lib/rtl";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function AppSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const sidebarSide = isRTLLocale(locale) ? "right" : "left";
  const t = useTranslations("appSidebar");
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      label: t("calendar"),
      href: "/admin/calendar",
      icon: LayoutDashboard,
    },
    {
      label: t("masters"),
      href: "/admin/masters",
      icon: Users,
    },
    {
      label: t("services"),
      href: "/admin/services",
      icon: Scissors,
    },
    {
      label: t("home"),
      href: "/home",
      icon: HomeIcon,
    },
  ];

  const MenuContent = () => (
    <SidebarMenu>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link
                href={item.href}
                className={cn("flex items-center gap-2", isActive && "bg-accent")}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  if (isMobile) {
    return (
      <div className="flex items-center gap-2 border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold">💅 {t("title")}</h1>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side={sidebarSide === "right" ? "right" : "left"}>
            <SheetHeader className="mb-6">
              <SheetTitle>
                <div>
                  <h1 className="text-lg font-bold">💅 {t("title")}</h1>
                  <p className="text-muted-foreground mt-1 text-xs">{t("subtitle")}</p>
                </div>
              </SheetTitle>
            </SheetHeader>
            <MenuContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <Sidebar side={sidebarSide}>
      <SidebarHeader className="border-b">
        <div className="px-2 py-3">
          <h1 className="text-lg font-bold">💅 {t("title")}</h1>
          <p className="text-muted-foreground text-xs">{t("subtitle")}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <MenuContent />
      </SidebarContent>
    </Sidebar>
  );
}
