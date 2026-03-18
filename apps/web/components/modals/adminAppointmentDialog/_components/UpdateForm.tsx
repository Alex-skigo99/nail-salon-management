"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import SelectInput from "@/components/inputs/SelectInput";
import SearchUserInput from "@/components/inputs/SearchUserInput";
import { PhoneFormInput, phoneSchemaOptional } from "@/components/inputs/PhoneFormInput";
import { useUpdateAppointment } from "@/hooks/useAppointments";
import { APPOINTMENT_STATUSES } from "@/types/appointmentTypes";
import type { Appointment } from "@/types/appointmentTypes";
import { CalendarClock, Trash2 } from "lucide-react";

const updateSchema = z.object({
  userId: z.uuid().nullable().optional(),
  userName: z.string().optional(),
  phone: phoneSchemaOptional,
  comments: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES),
});

type UpdateFormData = z.input<typeof updateSchema>;

type UpdateFormProps = {
  apt: Appointment;
  onSuccess: () => void;
  onReschedule: () => void;
  onDelete: () => void;
};

export function UpdateForm({ apt, onSuccess, onReschedule, onDelete }: UpdateFormProps) {
  const updateMutation = useUpdateAppointment();
  const [userId, setUserId] = useState<string | null>(apt.user_id ?? null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      userId: apt.user_id ?? null,
      userName: apt.guest_name ?? "",
      phone: apt.guest_phone ?? "",
      comments: apt.comments ?? "",
      status: apt.status,
    },
  });

  // Sync if apt changes
  useEffect(() => {
    const newUserId = apt.user_id ?? null;
    reset({
      userId: newUserId,
      userName: apt.guest_name ?? "",
      phone: apt.guest_phone ?? "",
      comments: apt.comments ?? "",
      status: apt.status,
    });
  }, [apt, reset]);

  const handlePreset = (name: "Lunch" | "Reserved") => {
    setValue("userName", name, { shouldDirty: true });
    setValue("status", "reserved", { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateMutation.mutateAsync({
        id: apt.id,
        data: {
          user_id: userId ?? null,
          guest_name: userId ? null : data.userName || null,
          guest_phone: userId ? null : data.phone || null,
          comments: data.comments || null,
          status: data.status,
        },
      });
      toast.success("Appointment updated");
      onSuccess();
    } catch {
      toast.error("Failed to update appointment. Please try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 py-2">
      {/* Existing client search */}
      <SearchUserInput
        value={userId}
        onChange={(id) => {
          setUserId(id);
          setValue("userId", id, { shouldDirty: true });
        }}
      />

      {/* Guest fields – hidden when a user is selected */}
      {!userId && (
        <>
          <div className="grid gap-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="update-userName">Guest Client Name</Label>
              <div className="ml-auto flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handlePreset("Lunch")}
                >
                  Lunch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handlePreset("Reserved")}
                >
                  Reserved
                </Button>
              </div>
            </div>
            <Controller
              name="userName"
              control={control}
              render={({ field }) => <Input id="update-userName" {...field} placeholder="John Doe" />}
            />
          </div>

          <PhoneFormInput
            control={control}
            name="phone"
            id="update-phone"
            label="Guest Client Phone"
            placeholder="+1234567890"
          />
        </>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="update-comments">Comments</Label>
        <Controller
          name="comments"
          control={control}
          render={({ field }) => <Input id="update-comments" {...field} placeholder="Any notes" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectInput
                value={field.value}
                onValueChange={field.onChange}
                options={APPOINTMENT_STATUSES.map((s) => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                }))}
                triggerClassName="w-full cursor-pointer"
              />
            )}
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Duration</Label>
          <p className="bg-muted/50 text-muted-foreground flex h-9 items-center rounded-md border border-transparent px-3 text-sm">
            {apt.duration_minutes} min
          </p>
        </div>
      </div>

      {apt.services && (
        <div className="grid gap-1.5">
          <Label>Services</Label>
          <p className="bg-muted/50 text-muted-foreground flex min-h-9 items-center rounded-md border border-transparent px-3 py-2 text-sm">
            {apt.services}
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-1">
        <div className="mr-auto flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReschedule}>
            <CalendarClock className="mr-1 h-4 w-4" />
            Reschedule
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
        <Button type="submit" disabled={updateMutation.isPending || isSubmitting}>
          {(updateMutation.isPending || isSubmitting) && <Spinner className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
