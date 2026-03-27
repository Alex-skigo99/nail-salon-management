"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SelectInput from "@/components/inputs/SelectInput";
import type { Master } from "@/types/masterTypes";
import type { UseUsersParams } from "@/hooks/useUsers";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-50 flex-1 first:mr-auto sm:max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by name, email or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>
      <Label>Sort:</Label>
      <SelectInput
        value={params.sort ?? SORT_DEFAULT}
        onValueChange={(val) => onChange({ ...params, sort: val === ALL ? undefined : val })}
        options={SORT_OPTIONS}
        placeholder="Sort by"
        triggerClassName="w-[180px] cursor-pointer"
      />

      <Label>Filters:</Label>
      <SelectInput
        value={params.role ?? ALL}
        onValueChange={(val) => onChange({ ...params, role: val === ALL ? undefined : val })}
        options={ROLE_OPTIONS}
        placeholder="Role"
        triggerClassName="w-[130px] cursor-pointer"
      />

      <SelectInput
        value={params.master_id ? String(params.master_id) : ALL}
        onValueChange={(val) => onChange({ ...params, master_id: val === ALL ? undefined : Number(val) })}
        options={masterOptions}
        placeholder="Master"
        triggerClassName="w-[150px] cursor-pointer"
      />
    </div>
  );
}
