import { z } from "zod";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PHONE_PATTERN = /^\+?[0-9\-\s()]+$/;
const PHONE_DIGIT_RANGE_PATTERN = /^(?=(?:\D*\d){7,15}\D*$)\+?[0-9\-\s()]+$/;

const phoneStringSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .regex(PHONE_PATTERN, "Invalid phone format")
  .regex(PHONE_DIGIT_RANGE_PATTERN, "Phone number must contain 7 to 15 digits");

export const phoneSchemaRequired = phoneStringSchema;

export const phoneSchemaOptional = z
  .union([z.literal(""), phoneStringSchema])
  .optional()
  .transform((value) => value ?? "");

type PhoneFormInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues, unknown, TFieldValues>;
  name: FieldPath<TFieldValues>;
  id: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
};

export function PhoneFormInput<TFieldValues extends FieldValues>({
  control,
  name,
  id,
  label = "Phone",
  placeholder = "+972-...",
  disabled,
  wrapperClassName = "grid gap-1.5",
  inputClassName,
}: PhoneFormInputProps<TFieldValues>) {
  return (
    <div className={wrapperClassName}>
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Input
              id={id}
              type="tel"
              autoComplete="tel"
              placeholder={placeholder}
              disabled={disabled}
              className={inputClassName}
              value={(field.value as string | undefined) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {fieldState.error?.message && <p className="text-sm text-red-600">{fieldState.error.message}</p>}
          </>
        )}
      />
    </div>
  );
}
