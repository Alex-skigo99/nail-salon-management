"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordInputProps = {
  id: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  showIcon?: boolean;
} & Omit<React.ComponentProps<"input">, "type">;

export function PasswordInput({
  id,
  label,
  placeholder,
  error,
  disabled,
  wrapperClassName = "space-y-2",
  inputClassName,
  showIcon = true,
  className,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={wrapperClassName}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        {showIcon && <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />}
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(showIcon && "pl-10", "pr-10", inputClassName, className)}
          {...inputProps}
        />
        <button
          type="button"
          className="absolute top-1/2 right-3 -translate-y-1/2"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="text-muted-foreground size-4" />
          ) : (
            <Eye className="text-muted-foreground size-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
