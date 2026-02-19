"use client";

import { Locale, useLocale } from "next-intl";
import { LOCALE_OPTIONS } from "@/const/locale";
import SelectInput from "@/components/inputs/SelectInput";

type Props = {
  handleLocaleChange: (locale: Locale) => Promise<void>;
};

export default function LocaleSwitcher({ handleLocaleChange }: Props) {
  const locale = useLocale();

  return (
    <div className="px-2 py-3">
      <SelectInput<string>
        value={locale}
        onValueChange={handleLocaleChange}
        options={LOCALE_OPTIONS}
        placeholder="Select locale"
        triggerClassName="w-full cursor-pointer"
      />
    </div>
  );
}
