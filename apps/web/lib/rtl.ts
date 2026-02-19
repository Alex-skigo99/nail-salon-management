/**
 * Utility for RTL (Right-to-Left) support
 */

// List of RTL locales
const RTL_LOCALES = ["ar", "he", "fa", "ur", "yi"];

// Locale flags mapping
const LOCALE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  it: "🇮🇹",
  he: "🇮🇱",
  ru: "🇷🇺",
  ar: "🇸🇦",
  fa: "🇮🇷",
  ur: "🇵🇰",
  yi: "🕎",
};

/**
 * Determines if a given locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Gets the direction (dir) for a locale
 */
export function getDirection(locale: string): "ltr" | "rtl" {
  return isRTLLocale(locale) ? "rtl" : "ltr";
}

/**
 * Gets the flag emoji for a locale
 */
export function getLocaleFlag(locale: string): string {
  return LOCALE_FLAGS[locale] || "🌐";
}
