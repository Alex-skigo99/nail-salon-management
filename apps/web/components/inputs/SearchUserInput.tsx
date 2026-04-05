"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types/userTypes";
import { cn } from "@/lib/utils";
import { XIcon, ChevronDownIcon } from "lucide-react";
import { EntityAvatar } from "../elements/EntityAvatar";

type SearchUserInputProps = {
  value: string | null;
  onChange: (userId: string | null) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  wrapperClassName?: string;
};

function formatUserLabel(user: User): string {
  const phone = user.phone ? ` - ${user.phone}` : "";
  return `${user.name}${phone}`;
}

export default function SearchUserInput({
  value,
  onChange,
  label = "Existing Client",
  placeholder = "Select a client...",
  id = "search-user",
  className,
  wrapperClassName = "grid gap-1.5",
}: SearchUserInputProps) {
  const { data: usersResponse } = useUsers();
  const users = usersResponse?.data ?? [];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedUser = value ? (users.find((u) => u.id === value) ?? null) : null;

  const filteredUsers =
    search.trim() === ""
      ? users
      : users.filter((u) => {
          const q = search.toLowerCase();
          return u.name.toLowerCase().includes(q) || (u.phone ?? "").toLowerCase().includes(q);
        });

  const handleSelect = (user: User | null) => {
    onChange(user ? user.id : null);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
    setSearch("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  };

  return (
    <div className={wrapperClassName}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverAnchor asChild>
          <div className="relative">
            <PopoverTrigger asChild>
              <button
                id={id}
                type="button"
                className={cn(
                  "border-input bg-background ring-offset-background flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  value !== null ? "pr-8" : "pr-3",
                  className
                )}
              >
                {selectedUser ? (
                  <>
                    <EntityAvatar src={selectedUser.image} alt={selectedUser.name} size="sm" />
                    <span className="flex-1 truncate text-left">{formatUserLabel(selectedUser)}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground flex-1 text-left">{placeholder}</span>
                )}
                {value === null && <ChevronDownIcon className="ml-auto size-4 shrink-0 opacity-50" />}
              </button>
            </PopoverTrigger>
            {value !== null && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                tabIndex={-1}
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-1"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
          align="start"
          sideOffset={4}
        >
          <div className="p-1 pb-0">
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="mb-1 h-8"
              autoComplete="off"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {/* None option */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(null);
              }}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                value === null && "bg-accent/50 font-medium"
              )}
            >
              <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded-full">
                <XIcon className="text-muted-foreground size-3" />
              </span>
              <span className="text-muted-foreground">None (Guest)</span>
            </button>

            {filteredUsers.length === 0 && (
              <p className="text-muted-foreground px-3 py-2 text-center text-sm">No users found</p>
            )}

            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(user);
                }}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  value === user.id && "bg-accent/50 font-medium"
                )}
              >
                <EntityAvatar src={user.image} alt={user.name} size="sm" />
                <span className="truncate">{formatUserLabel(user)}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
