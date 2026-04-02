"use client";

import { useState } from "react";
import { Locale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { changeLocaleAction } from "@/utils/changeLocaleAction";
import { UserMenu } from "@/components/UserMenu";
import SalonTitle from "@/components/elements/SalonTitle";
import InstagramIconLink from "@/components/icons/InstagramIconLink";

type SimpleT = (key: string) => string;
type Props = { t: ReturnType<typeof useTranslations> | SimpleT; isMobile: boolean };

export default function Header({ t, isMobile }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLocaleChange(locale: Locale) {
    await changeLocaleAction(locale);
  }

  const navLinks = [
    { label: t("headerShop"), href: "#shop" },
    { label: t("headerPrices"), href: "#prices" },
    { label: t("headerLocation"), href: "#map" },
  ];

  const navLinksMobile = [...navLinks, { label: t("heroBookBtn"), href: "#schedule" }];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-pink-100 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-350 items-center justify-between px-4 sm:px-6">
        <a href="#hero" className="flex items-center gap-2">
          <SalonTitle salonName={t("salonName")} />
        </a>

        {!isMobile && (
          <nav className="flex items-center gap-6">
            <InstagramIconLink
              className="size-8 rounded-md bg-white/80 backdrop-blur-md hover:bg-pink-300"
              iconClassName="text-pink-600"
            />
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-pink-600"
              >
                {link.label}
              </a>
            ))}
            <Button
              asChild
              size="sm"
              className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white opacity-50 backdrop-blur-md hover:from-pink-600 hover:to-rose-600"
            >
              <a href="#schedule">{t("heroBookBtn")}</a>
            </Button>
            <LocaleSwitcher
              handleLocaleChange={handleLocaleChange}
              wrapperClassName="px-0"
              triggerClassName="w-36 text-sm cursor-pointer hover:bg-gray-100"
            />
            <div className="w-60">
              <UserMenu />
            </div>
          </nav>
        )}

        {isMobile && (
          <>
            <InstagramIconLink
              className="size-7 rounded-md bg-pink-100 backdrop-blur-md hover:bg-pink-300"
              iconClassName="text-pink-600"
            />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 transition-colors hover:text-pink-600"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="animate-in slide-in-from-top-2 space-y-2 border-t border-pink-100 bg-white/95 px-4 pt-2 pb-4 backdrop-blur-md">
          {navLinksMobile.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <LocaleSwitcher
              handleLocaleChange={handleLocaleChange}
              wrapperClassName="px-0 py-1 flex-1"
              triggerClassName="w-full text-sm cursor-pointer hover:bg-gray-100"
            />
          </div>
          <div className="w-full rounded-4xl border-2 border-pink-100 bg-pink-50 p-1">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}
