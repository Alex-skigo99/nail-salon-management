import type { SelectOption } from "@/components/inputs/SelectInput";
import { getLocaleFlag } from "@/lib/rtl";

export const SUPPORTED_LOCALES = ["en", "he", "ru"];

export const DEFAULT_LOCALE = "en";

export const CONTACT_LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_OPTIONS: SelectOption[] = [
  { value: "en", label: `${getLocaleFlag("en")} English` },
  { value: "he", label: `${getLocaleFlag("he")} עברית` },
  { value: "ru", label: `${getLocaleFlag("ru")} Русский` },
];
