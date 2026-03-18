"use client";

import { z } from "zod";
import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import SelectInput from "@/components/inputs/SelectInput";
import type { ServiceCategory } from "@/types/serviceTypes";
import { CURRENCY_SYMBOL } from "@/const/currency";

export type ServicesSelectOption = {
  value: string;
  label: string;
  price?: string | number;
  duration_minutes?: number;
};

export type ServicesOptionsByCategory = Record<ServiceCategory, ServicesSelectOption[]>;

export type ServicesSelectionState = Record<ServiceCategory, string[]>;

export type ServicesInputCount = Record<ServiceCategory, number>;

type ServicesFormInputClasses = {
  wrapperClassName?: string;
  gridClassName?: string;
  inputGroupClassName?: string;
  triggerClassName?: string;
};

type ServicesFormInputLabels = {
  manicure?: string;
  pedicure?: string;
  other?: string;
};

type ServicesFormInputPlaceholders = {
  manicure?: string;
  pedicure?: string;
  other?: string;
};

type ServicesFormInputProps = {
  serviceOptions: ServicesOptionsByCategory;
  inputCountForServices: ServicesInputCount;
  inputRequired?: boolean;
  nameInSchema: string;
  priceShowing?: boolean;
  durationShowing?: boolean;
  servicesSelected: ServicesSelectionState;
  setServicesSelected: (value: ServicesSelectionState) => void;
  setValueBySchemaName?: (nameInSchema: string, value: string[]) => void;
  setServicesDuration: (value: number) => void;
  setServicesPrice?: (value: number) => void;
  classes?: ServicesFormInputClasses;
  labels?: ServicesFormInputLabels;
  placeholders?: ServicesFormInputPlaceholders;
  noneLabel?: string;
  requiredMessage?: string;
};

const CATEGORY_ORDER: ServiceCategory[] = ["manicure", "pedicure", "other"];

const DEFAULT_LABELS: Record<ServiceCategory, string> = {
  manicure: "Manicure Service",
  pedicure: "Pedicure Service",
  other: "Other Service",
};

const DEFAULT_PLACEHOLDERS: Record<ServiceCategory, string> = {
  manicure: "Select manicure service",
  pedicure: "Select pedicure service",
  other: "Select other service",
};

const formatPrice = (price: string | number | undefined) => {
  if (price === undefined || price === null || price === "") return "";
  const numericPrice = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(numericPrice)) return "";
  return `${CURRENCY_SYMBOL}${numericPrice.toFixed(2).replace(/\.00$/, "")}`;
};

const toNumber = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === "") return 0;
  const result = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(result) ? result : 0;
};

export default function ServicesFormInput({
  serviceOptions,
  inputCountForServices,
  inputRequired = false,
  nameInSchema,
  priceShowing = false,
  durationShowing = false,
  servicesSelected,
  setServicesSelected,
  setValueBySchemaName,
  setServicesDuration,
  setServicesPrice,
  classes,
  labels,
  placeholders,
  noneLabel = "None",
  requiredMessage = "Select at least one service",
}: ServicesFormInputProps) {
  const servicesSchema = useMemo(
    () => z.array(z.string()).refine((value) => value.length > 0, { message: requiredMessage }),
    [requiredMessage]
  );

  const optionsWithDefault = useMemo(() => {
    return {
      manicure: [
        { value: "none", label: noneLabel, duration_minutes: undefined, price: undefined },
        ...serviceOptions.manicure.map((option) => ({
          value: option.value,
          label: option.label,
          duration_minutes: option.duration_minutes,
          price: option.price,
        })),
      ],
      pedicure: [
        { value: "none", label: noneLabel, duration_minutes: undefined, price: undefined },
        ...serviceOptions.pedicure.map((option) => ({
          value: option.value,
          label: option.label,
          duration_minutes: option.duration_minutes,
          price: option.price,
        })),
      ],
      other: [
        { value: "none", label: noneLabel, duration_minutes: undefined, price: undefined },
        ...serviceOptions.other.map((option) => ({
          value: option.value,
          label: option.label,
          duration_minutes: option.duration_minutes,
          price: option.price,
        })),
      ],
    };
  }, [serviceOptions, noneLabel]);

  const displayedOptions = useMemo(() => {
    return {
      manicure: optionsWithDefault.manicure.map((option) => {
        if (option.value === "none") return option;
        const additions: string[] = [];
        if (durationShowing && option.duration_minutes) {
          additions.push(`${option.duration_minutes}m`);
        }
        if (priceShowing) {
          const formatted = formatPrice(option.price);
          if (formatted) additions.push(formatted);
        }
        return {
          ...option,
          label: additions.length > 0 ? `${option.label} (${additions.join(" • ")})` : option.label,
        };
      }),
      pedicure: optionsWithDefault.pedicure.map((option) => {
        if (option.value === "none") return option;
        const additions: string[] = [];
        if (durationShowing && option.duration_minutes) {
          additions.push(`${option.duration_minutes}m`);
        }
        if (priceShowing) {
          const formatted = formatPrice(option.price);
          if (formatted) additions.push(formatted);
        }
        return {
          ...option,
          label: additions.length > 0 ? `${option.label} (${additions.join(" • ")})` : option.label,
        };
      }),
      other: optionsWithDefault.other.map((option) => {
        if (option.value === "none") return option;
        const additions: string[] = [];
        if (durationShowing && option.duration_minutes) {
          additions.push(`${option.duration_minutes}m`);
        }
        if (priceShowing) {
          const formatted = formatPrice(option.price);
          if (formatted) additions.push(formatted);
        }
        return {
          ...option,
          label: additions.length > 0 ? `${option.label} (${additions.join(" • ")})` : option.label,
        };
      }),
    };
  }, [optionsWithDefault, durationShowing, priceShowing]);

  useEffect(() => {
    const selectedOptions = CATEGORY_ORDER.flatMap((category) => {
      const categoryValues = servicesSelected[category] || [];
      return categoryValues
        .filter((value) => value && value !== "none")
        .map((value) => serviceOptions[category].find((option) => option.value === value))
        .filter(Boolean) as ServicesSelectOption[];
    });

    const totalDuration = selectedOptions.reduce((acc, option) => acc + toNumber(option.duration_minutes), 0);
    const totalPrice = selectedOptions.reduce((acc, option) => acc + toNumber(option.price), 0);

    setServicesDuration(totalDuration);
    if (setServicesPrice) setServicesPrice(totalPrice);
  }, [serviceOptions, servicesSelected, nameInSchema, setValueBySchemaName, setServicesDuration, setServicesPrice]);

  const selectedValues = useMemo(() => {
    return CATEGORY_ORDER.flatMap((category) =>
      (servicesSelected[category] || []).filter((value) => value && value !== "none")
    );
  }, [servicesSelected]);

  const validationError = useMemo(() => {
    if (!inputRequired) return "";
    const result = servicesSchema.safeParse(selectedValues);
    if (result.success) return "";
    return result.error.issues[0]?.message ?? requiredMessage;
  }, [inputRequired, servicesSchema, selectedValues, requiredMessage]);

  const handleChange = (category: ServiceCategory, index: number, value: string) => {
    const categoryValues = [...(servicesSelected[category] || [])];
    categoryValues[index] = value;

    const next = {
      ...servicesSelected,
      [category]: categoryValues,
    };

    setServicesSelected(next);
    // Also sync the updated selection to the external form state and totals.
    if (setValueBySchemaName || setServicesDuration || setServicesPrice) {
      const selectedOptions = CATEGORY_ORDER.flatMap((cat) => {
        const vals = next[cat] || [];
        return vals
          .filter((v) => v && v !== "none")
          .map((v) => serviceOptions[cat].find((option) => option.value === v))
          .filter(Boolean) as ServicesSelectOption[];
      });

      const totalDuration = selectedOptions.reduce((acc, option) => acc + toNumber(option.duration_minutes), 0);
      const totalPrice = selectedOptions.reduce((acc, option) => acc + toNumber(option.price), 0);
      const selectedValues = selectedOptions.map((option) => option.value);

      if (setServicesDuration) setServicesDuration(totalDuration);
      if (setServicesPrice) setServicesPrice(totalPrice);
      if (setValueBySchemaName) setValueBySchemaName(nameInSchema, selectedValues);
    }
  };

  return (
    <div className={classes?.wrapperClassName ?? "space-y-3 rounded-xl border border-gray-200 p-4"}>
      <div className={classes?.gridClassName ?? "grid gap-3"}>
        {CATEGORY_ORDER.map((category) => {
          const count = inputCountForServices[category] ?? 1;

          return Array.from({ length: count }).map((_, index) => {
            const label = labels?.[category] ?? DEFAULT_LABELS[category];
            const inputLabel = count > 1 ? `${label} ${index + 1}` : label;
            const selectedValue = servicesSelected[category]?.[index] ?? "none";

            return (
              <div className={classes?.inputGroupClassName ?? "grid gap-1.5"} key={`${category}-${index}`}>
                <Label>{inputLabel}</Label>
                <SelectInput
                  value={selectedValue}
                  onValueChange={(value) => handleChange(category, index, value)}
                  options={displayedOptions[category]}
                  placeholder={placeholders?.[category] ?? DEFAULT_PLACEHOLDERS[category]}
                  triggerClassName={classes?.triggerClassName ?? "w-full cursor-pointer"}
                />
              </div>
            );
          });
        })}
      </div>

      {inputRequired && validationError && <p className="text-sm text-red-600">{validationError}</p>}
    </div>
  );
}
