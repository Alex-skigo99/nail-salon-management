"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types/userTypes";
import { cn } from "@/lib/utils";
import { UserIcon, XIcon } from "lucide-react";

type SearchUserInputProps = {
  value: string | null;
  onChange: (userId: string | null) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  wrapperClassName?: string;
};

function UserAvatar({ user }: { user: User }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className="size-5 shrink-0 rounded-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full">
      <UserIcon className="size-3" />
    </span>
  );
}

function formatUserLabel(user: User): string {
  const phone = user.phone ? ` - ${user.phone}` : "";
  return `${user.name}${phone}`;
}

export default function SearchUserInput({
  value,
  onChange,
  label = "Existing Client",
  placeholder = "Search by name or phone...",
  id = "search-user",
  className,
  wrapperClassName = "grid gap-1.5",
}: SearchUserInputProps) {
  const { data: users = [] } = useUsers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wasJustSelected = useRef(false);

  const selectedUser = value ? (users.find((u) => u.id === value) ?? null) : null;

  // Sync search display when value changes externally
  useEffect(() => {
    if (selectedUser) {
      setSearch(formatUserLabel(selectedUser));
    } else if (!open) {
      setSearch("");
    }
  }, [selectedUser, open]);

  const filteredUsers =
    search.trim() === "" || (selectedUser && search === formatUserLabel(selectedUser))
      ? users
      : users.filter((u) => {
          const q = search.toLowerCase();
          return u.name.toLowerCase().includes(q) || (u.phone ?? "").toLowerCase().includes(q);
        });

  const handleSelect = (user: User | null) => {
    wasJustSelected.current = true;
    onChange(user ? user.id : null);
    setSearch(user ? formatUserLabel(user) : "");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (val === "") {
      onChange(null);
    }
    if (!open) setOpen(true);
  };

  const handleInputFocus = () => {
    if (!wasJustSelected.current) {
      setOpen(true);
    }
    wasJustSelected.current = false;
  };

  const handleClear = () => {
    onChange(null);
    setSearch("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={wrapperClassName}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              id={id}
              ref={inputRef}
              value={search}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={() => {
                // Delay so click on item registers first
                setTimeout(() => {
                  setOpen(false);
                  // Don't reset if we just selected something (value will sync via effect)
                  if (wasJustSelected.current) {
                    wasJustSelected.current = false;
                    return;
                  }
                  // Reset to selected user label if not empty
                  if (!search.trim()) {
                    onChange(null);
                  } else if (selectedUser) {
                    setSearch(formatUserLabel(selectedUser));
                  } else {
                    setSearch("");
                  }
                }, 150);
              }}
              placeholder={placeholder}
              className={cn("pr-8", className)}
              autoComplete="off"
            />
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
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={4}
        >
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
                <UserAvatar user={user} />
                <span className="truncate">{formatUserLabel(user)}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
