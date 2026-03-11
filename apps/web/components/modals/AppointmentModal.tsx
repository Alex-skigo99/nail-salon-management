"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import SelectInput from "@/components/inputs/SelectInput";
import {
  useCreateAppointment,
  useUpdateAppointment,
  useRescheduleAppointment,
  useDeleteAppointment,
} from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import type { Slot } from "@/types/appointmentTypes";
import { APPOINTMENT_STATUSES } from "@/types/appointmentTypes";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { formatDateForInput } from "@/utils/dateUtils";
import { CalendarClock, Trash2 } from "lucide-react";

// TODO: fetch gap from server or config, and enforce on backend as well. For now we just use a constant and validate on frontend.
const gap = 30; // minimum time gap in minutes between appointments

const appointmentSchema = z.object({
  userName: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // optional
      // Basic phone validation (can be improved)
      const digits = val.replace(/\D/g, "");
      return /^\+?[0-9-]+$/.test(val) && digits.length >= 7 && digits.length <= 15;
    }, "Invalid phone number format"),
  serviceManicure: z.string().optional(),
  servicePedicure: z.string().optional(),
  serviceOther: z.string().optional(),
  comments: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES),
  duration: z.number().min(gap).multipleOf(gap),
  rescheduleDate: z.string().optional(),
  rescheduleTime: z.string().optional(),
  rescheduleDuration: z.number().min(gap).multipleOf(gap).optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

type AppointmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: Slot | null;
  date: string;
  masterId: number;
};

export function AppointmentModal({ open, onOpenChange, slot, date, masterId }: AppointmentModalProps) {
  const isExisting = !!slot?.appointment_data;
  const apt = slot?.appointment_data;

  // UI state
  const [showReschedule, setShowReschedule] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: services = [] } = useServices();

  // Group services by category
  const servicesByCategory = useMemo(() => {
    return {
      manicure: services.filter((s) => s.category === "manicure"),
      pedicure: services.filter((s) => s.category === "pedicure"),
      other: services.filter((s) => s.category === "other"),
    };
  }, [services]);

  // Create select options for each category
  const serviceOptions = useMemo(
    () => ({
      manicure: servicesByCategory.manicure.map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
      pedicure: servicesByCategory.pedicure.map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
      other: servicesByCategory.other.map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    }),
    [servicesByCategory]
  );

  // Add empty option to each
  const optionsWithEmpty = useMemo(
    () => ({
      manicure: [{ value: "none", label: "None" }, ...serviceOptions.manicure],
      pedicure: [{ value: "none", label: "None" }, ...serviceOptions.pedicure],
      other: [{ value: "none", label: "None" }, ...serviceOptions.other],
    }),
    [serviceOptions]
  );

  // Form management
  const {
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      userName: "",
      phone: "",
      serviceManicure: "none",
      servicePedicure: "none",
      serviceOther: "none",
      comments: "",
      status: "new",
      duration: gap,
      rescheduleDate: date,
      rescheduleTime: slot ? formatTimeToHHMM(slot.start_time) : "10:00",
      rescheduleDuration: gap,
    },
  });

  // Watch service selections for duration calculation
  const serviceManicureId = watch("serviceManicure");
  const servicePedicureId = watch("servicePedicure");
  const serviceOtherId = watch("serviceOther");

  // Build services display string
  const servicesDisplay = useMemo(() => {
    const selected = [];
    if (serviceManicureId && serviceManicureId !== "none") {
      const svc = servicesByCategory.manicure.find((s) => String(s.id) === serviceManicureId);
      if (svc) selected.push(svc.name);
    }
    if (servicePedicureId && servicePedicureId !== "none") {
      const svc = servicesByCategory.pedicure.find((s) => String(s.id) === servicePedicureId);
      if (svc) selected.push(svc.name);
    }
    if (serviceOtherId && serviceOtherId !== "none") {
      const svc = servicesByCategory.other.find((s) => String(s.id) === serviceOtherId);
      if (svc) selected.push(svc.name);
    }
    return selected.join(", ");
  }, [serviceManicureId, servicePedicureId, serviceOtherId, servicesByCategory]);

  // Calculate duration from selected services
  useEffect(() => {
    let totalDuration = 0;

    if (serviceManicureId) {
      const svc = servicesByCategory.manicure.find((s) => String(s.id) === serviceManicureId);
      if (svc) totalDuration += svc.duration_minutes;
    }
    if (servicePedicureId) {
      const svc = servicesByCategory.pedicure.find((s) => String(s.id) === servicePedicureId);
      if (svc) totalDuration += svc.duration_minutes;
    }
    if (serviceOtherId) {
      const svc = servicesByCategory.other.find((s) => String(s.id) === serviceOtherId);
      if (svc) totalDuration += svc.duration_minutes;
    }

    if (totalDuration > 0) {
      // Use watch and manually update if needed via form state
      const currentDuration = watch("duration");
      // Only auto-update if user hasn't manually set it
      if (currentDuration === gap || (currentDuration && Math.abs(currentDuration - totalDuration) < 1)) {
        setValue("duration", totalDuration, { shouldDirty: true });
      }
    }
  }, [serviceManicureId, servicePedicureId, serviceOtherId, servicesByCategory, watch, setValue]);

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const deleteMutation = useDeleteAppointment();

  const isMutating =
    createMutation.isPending || updateMutation.isPending || rescheduleMutation.isPending || deleteMutation.isPending;

  // Reset form and UI state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setShowReschedule(false);
      setConfirmDelete(false);
      return;
    }
    if (apt) {
      reset({
        userName: apt.user_name ?? "",
        phone: apt.whatsapp_phone ?? "",
        comments: apt.comments ?? "",
        status: apt.status,
        duration: apt.duration_minutes,
        rescheduleDate: formatDateForInput(apt.date),
        rescheduleTime: formatTimeToHHMM(apt.time),
        rescheduleDuration: apt.duration_minutes,
      });
    } else {
      reset({
        userName: "",
        phone: "",
        serviceManicure: "none",
        servicePedicure: "none",
        serviceOther: "none",
        comments: "",
        status: "new",
        duration: gap,
        rescheduleDate: formatDateForInput(date),
        rescheduleTime: slot ? formatTimeToHHMM(slot.start_time) : "10:00",
        rescheduleDuration: gap,
      });
    }
  }, [open, apt, slot, date, reset]);

  const handleCreate = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        master_id: masterId,
        date,
        time: slot ? formatTimeToHHMM(slot.start_time) : "10:00",
        duration_minutes: data.duration,
        user_name: data.userName || null,
        whatsapp_phone: data.phone || null,
        services: servicesDisplay || null,
        comments: data.comments || null,
        status: data.status,
      });
      toast.success("Appointment created");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to create appointment");
    }
  });

  const handleUpdate = handleSubmit(async (data) => {
    if (!apt) return;
    try {
      await updateMutation.mutateAsync({
        id: apt.id,
        data: {
          user_name: data.userName || null,
          whatsapp_phone: data.phone || null,
          services: servicesDisplay || apt.services,
          comments: data.comments || null,
          status: data.status,
        },
      });
      toast.success("Appointment updated");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to update appointment");
    }
  });

  const handleReschedule = handleSubmit(async (data) => {
    if (!apt) return;
    try {
      await rescheduleMutation.mutateAsync({
        id: apt.id,
        data: {
          date: data.rescheduleDate || date,
          time: data.rescheduleTime || formatTimeToHHMM(slot?.start_time || "10:00"),
          duration_minutes: data.rescheduleDuration || data.duration,
        },
      });
      toast.success("Appointment rescheduled");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Slot unavailable");
    }
  });

  const handleDelete = async () => {
    if (!apt) return;
    try {
      await deleteMutation.mutateAsync(apt.id);
      toast.success("Appointment deleted");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to delete");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isExisting ? "Edit Appointment" : "New Appointment"}
            {slot && (
              <span className="text-muted-foreground text-sm font-normal">
                {date} · {formatTimeToHHMM(slot.start_time)}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {isExisting ? "Update appointment details, reschedule, or delete." : "Fill in details to book this slot."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Main form ─────────────────────────────── */}
        {!showReschedule && !confirmDelete && (
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="userName">Client Name</Label>
              <Controller
                name="userName"
                control={control}
                render={({ field }) => <Input id="userName" {...field} placeholder="John Doe" />}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">WhatsApp Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input id="phone" {...field} placeholder="+1234567890" />}
              />
            </div>

            {/* Services by Category */}
            <div className="bg-background rounded-lg border p-4">
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Manicure Service</Label>
                  <Controller
                    name="serviceManicure"
                    control={control}
                    render={({ field }) => (
                      <SelectInput
                        value={field.value as string}
                        onValueChange={field.onChange}
                        options={optionsWithEmpty.manicure}
                        placeholder="Select manicure..."
                        triggerClassName="w-full cursor-pointer"
                      />
                    )}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Pedicure Service</Label>
                  <Controller
                    name="servicePedicure"
                    control={control}
                    render={({ field }) => (
                      <SelectInput
                        value={field.value as string}
                        onValueChange={field.onChange}
                        options={optionsWithEmpty.pedicure}
                        placeholder="Select pedicure..."
                        triggerClassName="w-full cursor-pointer"
                      />
                    )}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Other Service</Label>
                  <Controller
                    name="serviceOther"
                    control={control}
                    render={({ field }) => (
                      <SelectInput
                        value={field.value as string}
                        onValueChange={field.onChange}
                        options={optionsWithEmpty.other}
                        placeholder="Select other service..."
                        triggerClassName="w-full cursor-pointer"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="comments">Comments</Label>
              <Controller
                name="comments"
                control={control}
                render={({ field }) => <Input id="comments" {...field} placeholder="Any notes" />}
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
                <Label htmlFor="duration">Duration (min)</Label>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="duration"
                      type="number"
                      min={15}
                      step={15}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Reschedule form ───────────────────────── */}
        {showReschedule && (
          <div className="grid gap-3 py-2">
            <p className="text-muted-foreground text-sm">
              Move this appointment to a new date/time. Availability will be checked.
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="rDate">New Date</Label>
              <Controller
                name="rescheduleDate"
                control={control}
                render={({ field }) => <Input id="rDate" type="date" {...field} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="rTime">New Time</Label>
                <Controller
                  name="rescheduleTime"
                  control={control}
                  render={({ field }) => <Input id="rTime" type="time" {...field} />}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rDur">Duration (min)</Label>
                <Controller
                  name="rescheduleDuration"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="rDur"
                      type="number"
                      min={15}
                      step={15}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Delete confirmation ───────────────────── */}
        {confirmDelete && (
          <div className="py-4 text-center">
            <p className="text-destructive font-medium">Are you sure you want to delete this appointment?</p>
            <p className="text-muted-foreground mt-1 text-sm">This action cannot be undone.</p>
          </div>
        )}

        {/* ── Footer buttons ────────────────────────── */}
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {/* Default view */}
          {!showReschedule && !confirmDelete && (
            <>
              {isExisting && (
                <div className="mr-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowReschedule(true)}>
                    <CalendarClock className="mr-1 h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
              <Button onClick={isExisting ? handleUpdate : handleCreate} disabled={isMutating || isSubmitting}>
                {(isMutating || isSubmitting) && <Spinner className="mr-2 h-4 w-4" />}
                {isExisting ? "Save Changes" : "Create"}
              </Button>
            </>
          )}

          {/* Reschedule view */}
          {showReschedule && (
            <>
              <Button variant="outline" onClick={() => setShowReschedule(false)}>
                Back
              </Button>
              <Button onClick={handleReschedule} disabled={isMutating || isSubmitting}>
                {(isMutating || isSubmitting) && <Spinner className="mr-2 h-4 w-4" />}
                Confirm Reschedule
              </Button>
            </>
          )}

          {/* Delete view */}
          {confirmDelete && (
            <>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isMutating}>
                {isMutating && <Spinner className="mr-2 h-4 w-4" />}
                Confirm Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
