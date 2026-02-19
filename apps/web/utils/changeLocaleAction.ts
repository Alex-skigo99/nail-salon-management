"use server";

import { Locale } from "next-intl";
import { cookies } from "next/headers";
import { CONTACT_LOCALE_COOKIE } from "@/const/locale";

export async function changeLocaleAction(locale: Locale) {
  const store = await cookies();
  store.set(CONTACT_LOCALE_COOKIE, locale);
}
