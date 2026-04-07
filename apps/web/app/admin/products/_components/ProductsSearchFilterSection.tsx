"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectInput from "@/components/inputs/SelectInput";
import type { UseProductsParams } from "@/hooks/useProducts";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ALL = "__all__";

const SORT_OPTIONS = [
  { value: "name_asc", label: "A → Z" },
  { value: "name_desc", label: "Z → A" },
  { value: "quantity_asc", label: "Quantity ↑" },
  { value: "quantity_desc", label: "Quantity ↓" },
  { value: "created_desc", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

const SORT_DEFAULT = "created_desc";

const TYPE_OPTIONS = [
  { value: ALL, label: "All Types" },
  { value: "nail_care", label: "Nail Care" },
  { value: "tools", label: "Tools" },
  { value: "accessories", label: "Accessories" },
  { value: "other", label: "Other" },
];

const AVAILABILITY_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "true", label: "Available" },
  { value: "false", label: "Not Available" },
];

const HOME_DISPLAY_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "true", label: "Home Display" },
  { value: "false", label: "Not Displayed" },
];

type ProductsSearchFilterSectionProps = {
  params: UseProductsParams;
  onChange: (params: UseProductsParams) => void;
};

export function ProductsSearchFilterSection({ params, onChange }: ProductsSearchFilterSectionProps) {
  const [searchInput, setSearchInput] = useState(params.search ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== (params.search ?? "")) {
        onChange({ ...params, search: trimmed || undefined });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFilterCount = [
    params.sort && params.sort !== SORT_DEFAULT,
    params.type,
    params.is_available,
    params.is_home_display,
  ].filter(Boolean).length;

  const filtersContent = (
    <>
      <Label>Sort:</Label>
      <SelectInput
        value={params.sort ?? SORT_DEFAULT}
        onValueChange={(val) => onChange({ ...params, sort: val === SORT_DEFAULT ? undefined : val })}
        options={SORT_OPTIONS}
        placeholder="Sort by"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[140px] cursor-pointer")}
      />

      <Label>Filters:</Label>
      <SelectInput
        value={params.type ?? ALL}
        onValueChange={(val) => onChange({ ...params, type: val === ALL ? undefined : val })}
        options={TYPE_OPTIONS}
        placeholder="Type"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[140px] cursor-pointer")}
      />

      <SelectInput
        value={params.is_available ?? ALL}
        onValueChange={(val) => onChange({ ...params, is_available: val === ALL ? undefined : val })}
        options={AVAILABILITY_OPTIONS}
        placeholder="Availability"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[140px] cursor-pointer")}
      />

      <SelectInput
        value={params.is_home_display ?? ALL}
        onValueChange={(val) => onChange({ ...params, is_home_display: val === ALL ? undefined : val })}
        options={HOME_DISPLAY_OPTIONS}
        placeholder="Home Display"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[150px] cursor-pointer")}
      />
    </>
  );

  return (
    <div className={cn("mb-4 flex items-center gap-3", { "mb-2 px-2": isMobile })}>
      <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", { "first:mr-auto": !isMobile })}>
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={isMobile ? "Search..." : "Search by title..."}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {isMobile ? (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-70">
            <SheetHeader>
              <SheetTitle>Sort & Filters</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-6">{filtersContent}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex flex-wrap items-center gap-3">{filtersContent}</div>
      )}
    </div>
  );
}
