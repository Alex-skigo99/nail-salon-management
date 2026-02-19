import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export default function SelectInput<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName = "w-[150px] cursor-pointer",
}: SelectInputProps<T>) {
  return (
    <Select value={value} onValueChange={(newValue: T) => onValueChange(newValue)}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={`border bg-white shadow-md ${className || ""}`}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
