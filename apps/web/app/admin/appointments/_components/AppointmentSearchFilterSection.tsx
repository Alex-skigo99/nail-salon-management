"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectInput from "@/components/inputs/SelectInput";
import type { Master } from "@/types/masterTypes";
import type { UseAllAppointmentsParams } from "@/hooks/useAppointments";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ALL = "__all__";

const SORT_OPTIONS = [
  { value: "created_desc", label: "Created (newest)" },
  { value: "date_desc", label: "Date/Time (newest)" },
  { value: "username_asc", label: "Username A→Z" },
  { value: "username_desc", label: "Username Z→A" },
];

const SORT_DEFAULT = "created_desc";

const STATUS_OPTIONS = [
  { value: ALL, label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "reserved", label: "Reserved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

type AppointmentSearchFilterSectionProps = {
  params: UseAllAppointmentsParams;
  onChange: (params: UseAllAppointmentsParams) => void;
  masters: Master[];
};

export function AppointmentSearchFilterSection({ params, onChange, masters }: AppointmentSearchFilterSectionProps) {
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

  const activeFilterCount = [
    params.sort && params.sort !== SORT_DEFAULT,
    params.status,
    params.master_id,
    params.from,
    params.to,
  ].filter(Boolean).length;

  const filtersContent = (
    <>
      <Label>Sort:</Label>
      <SelectInput
        value={params.sort ?? SORT_DEFAULT}
        onValueChange={(val) => onChange({ ...params, sort: val === SORT_DEFAULT ? undefined : val })}
        options={SORT_OPTIONS}
        placeholder="Sort by"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[180px] cursor-pointer")}
      />

      <Label>Filters:</Label>
      <SelectInput
        value={params.status ?? ALL}
        onValueChange={(val) => onChange({ ...params, status: val === ALL ? undefined : val })}
        options={STATUS_OPTIONS}
        placeholder="Status"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[150px] cursor-pointer")}
      />

      <SelectInput
        value={params.master_id ? String(params.master_id) : ALL}
        onValueChange={(val) => onChange({ ...params, master_id: val === ALL ? undefined : Number(val) })}
        options={masterOptions}
        placeholder="Master"
        triggerClassName={cn(isMobile ? "w-full cursor-pointer" : "w-[150px] cursor-pointer")}
      />

      <Label>From:</Label>
      <Input
        type="date"
        value={params.from ?? ""}
        onChange={(e) => onChange({ ...params, from: e.target.value || undefined })}
        className={cn(isMobile ? "w-full" : "w-38")}
      />

      <Label>To:</Label>
      <Input
        type="date"
        value={params.to ?? ""}
        onChange={(e) => onChange({ ...params, to: e.target.value || undefined })}
        className={cn(isMobile ? "w-full" : "w-38")}
      />
    </>
  );

  return (
    <div className={cn("mb-4 flex items-center gap-3", { "mb-2 px-2": isMobile })}>
      <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", { "first:mr-auto": !isMobile })}>
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={isMobile ? "Search..." : "Search by name, email, phone or services..."}
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
