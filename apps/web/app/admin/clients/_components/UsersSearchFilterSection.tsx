"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectInput from "@/components/inputs/SelectInput";
import type { Master } from "@/types/masterTypes";
import type { UseUsersParams } from "@/hooks/useUsers";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ALL = "__all__";

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "last_appts", label: "Last Appointments" },
  { value: "appts_count", label: "Appointments Count" },
  { value: "created_desc", label: "Newest" },
  { value: "created_asc", label: "Oldest" },
];

const SORT_DEFAULT = "name";

const ROLE_OPTIONS = [
  { value: ALL, label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

type UsersSearchFilterSectionProps = {
  params: UseUsersParams;
  onChange: (params: UseUsersParams) => void;
  masters: Master[];
};

export function UsersSearchFilterSection({ params, onChange, masters }: UsersSearchFilterSectionProps) {
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

  const masterOptions = [
    { value: ALL, label: "All Masters" },
    ...masters.map((m) => ({ value: String(m.id), label: m.name })),
  ];

  const activeFilterCount = [params.sort && params.sort !== SORT_DEFAULT, params.role, params.master_id].filter(
    Boolean
  ).length;

  const filtersContent = (
    <>
      <Label>Sort:</Label>
      <SelectInput
        value={params.sort ?? SORT_DEFAULT}
        onValueChange={(val) => onChange({ ...params, sort: val === ALL ? undefined : val })}
        options={SORT_OPTIONS}
        placeholder="Sort by"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[180px] cursor-pointer")}
      />

      <Label>Filters:</Label>
      <SelectInput
        value={params.role ?? ALL}
        onValueChange={(val) => onChange({ ...params, role: val === ALL ? undefined : val })}
        options={ROLE_OPTIONS}
        placeholder="Role"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[130px] cursor-pointer")}
      />

      <SelectInput
        value={params.master_id ? String(params.master_id) : ALL}
        onValueChange={(val) => onChange({ ...params, master_id: val === ALL ? undefined : Number(val) })}
        options={masterOptions}
        placeholder="Master"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[150px] cursor-pointer")}
      />
    </>
  );

  return (
    <div className={cn("mb-4 flex items-center gap-3", { "mb-2 px-2": isMobile })}>
      <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", { "first:mr-auto": !isMobile })}>
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={isMobile ? "Search..." : "Search by name, email or phone..."}
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
