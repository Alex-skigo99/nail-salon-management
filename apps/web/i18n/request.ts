import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, CONTACT_LOCALE_COOKIE } from "@/const/locale";

export default getRequestConfig(async (params) => {
  const store = await cookies();

  const cookieLocale = store.get(CONTACT_LOCALE_COOKIE)?.value;

  const preferred = params.locale || cookieLocale || DEFAULT_LOCALE;

  const locale = SUPPORTED_LOCALES.includes(preferred) ? preferred : DEFAULT_LOCALE;

  const messages = (await import(`../locales/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
