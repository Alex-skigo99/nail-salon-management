"use client";

import { Locale, useLocale } from "next-intl";
import { LOCALE_OPTIONS } from "@/const/locale";
import SelectInput from "@/components/inputs/SelectInput";

type Props = {
  handleLocaleChange: (locale: Locale) => Promise<void>;
  wrapperClassName?: string;
  triggerClassName?: string;
};

export default function LocaleSwitcher({ handleLocaleChange, wrapperClassName, triggerClassName }: Props) {
  const locale = useLocale();

  const wrapper = wrapperClassName ?? "px-2 py-3";
  const trigger = triggerClassName ?? "w-full cursor-pointer";

  return (
    <div className={wrapper}>
      <SelectInput<string>
        value={locale}
        onValueChange={handleLocaleChange}
        options={LOCALE_OPTIONS}
        placeholder="Select locale"
        triggerClassName={trigger}
      />
    </div>
  );
}
