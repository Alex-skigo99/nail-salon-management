"use client";

import { useState } from "react";
import { Locale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import LocaleSwitcher from "@/components/sidebars/LocaleSwitcher";
import { changeLocaleAction } from "@/utils/changeLocaleAction";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

export default function Header({ t, isMobile }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLocaleChange(locale: Locale) {
    await changeLocaleAction(locale);
  }

  const navLinks = [
    { label: t("headerCustomer"), href: "/admin" },
    { label: t("headerPrices"), href: "#prices" },
    { label: t("headerLocation"), href: "#map" },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-pink-100 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#hero" className="flex items-center gap-2">
          <Sparkles className="size-6 text-pink-500" />
          <span className="bg-linear-to-r from-pink-600 to-rose-400 bg-clip-text text-lg font-bold text-transparent">
            {t("salonName")}
          </span>
        </a>

        {!isMobile && (
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-pink-600"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center">
              <LocaleSwitcher
                handleLocaleChange={handleLocaleChange}
                wrapperClassName="px-0"
                triggerClassName="w-28 text-sm"
              />
            </div>
            <Button
              asChild
              size="sm"
              className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
            >
              <a href="#schedule">{t("heroBookBtn")}</a>
            </Button>
          </nav>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-600 transition-colors hover:text-pink-600"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="animate-in slide-in-from-top-2 space-y-2 border-t border-pink-100 bg-white/95 px-4 pt-2 pb-4 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-1">
            <LocaleSwitcher
              handleLocaleChange={handleLocaleChange}
              wrapperClassName="px-0 py-1"
              triggerClassName="w-full text-sm"
            />
          </div>
          <Button asChild size="sm" className="w-full border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white">
            <a href="#schedule" onClick={() => setMenuOpen(false)}>
              {t("heroBookBtn")}
            </a>
          </Button>
        </div>
      )}
    </header>
  );
}
