"use client";

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
import { LayoutDashboard, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isRTLLocale } from "@/lib/rtl";
import { useTranslations } from "next-intl";

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

  const menuItems: MenuItem[] = [
    {
      label: t("calendar"),
      href: "/admin/calendar",
      icon: LayoutDashboard,
    },
    {
      label: t("home"),
      href: "/home",
      icon: LayoutDashboard,
    },
  ];

  return (
    <Sidebar side={sidebarSide}>
      <SidebarHeader className="border-b">
        <div className="px-2 py-3">
          <h1 className="text-lg font-bold">💅 {t("title")}</h1>
          <p className="text-muted-foreground text-xs">{t("subtitle")}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} className={cn("flex items-center gap-2", isActive && "bg-accent")}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
