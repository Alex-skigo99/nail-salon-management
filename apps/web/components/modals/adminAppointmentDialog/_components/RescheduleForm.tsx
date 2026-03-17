"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import ServicesFormInput, { type ServicesSelectionState } from "@/components/inputs/ServicesFormInput";
import { useRescheduleAppointment } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import type { Appointment, Slot } from "@/types/appointmentTypes";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { formatDateForInput } from "@/utils/dateUtils";

const gap = 30;

const rescheduleSchema = z.object({
  rescheduleDate: z.string().min(1, "Date is required"),
  rescheduleTime: z.string().min(1, "Time is required"),
  rescheduleDuration: z.number().min(gap).multipleOf(gap),
  services: z.array(z.string()),
});

type RescheduleFormData = z.input<typeof rescheduleSchema>;

const INPUT_COUNT_FOR_SERVICES = { manicure: 1, pedicure: 1, other: 1 } as const;

const createInitialServicesSelected = (): ServicesSelectionState => ({
  manicure: ["none"],
  pedicure: ["none"],
  other: ["none"],
});

type RescheduleFormProps = {
  apt: Appointment;
  slot: Slot | null;
  date: string;
  onSuccess: () => void;
  onBack: () => void;
};

export function RescheduleForm({ apt, slot, date, onSuccess, onBack }: RescheduleFormProps) {
  const { data: services = [] } = useServices();
  const rescheduleMutation = useRescheduleAppointment();

  const [servicesSelected, setServicesSelected] = useState<ServicesSelectionState>(createInitialServicesSelected);
  const [servicesDuration, setServicesDuration] = useState(0);

  const servicesByCategory = useMemo(
    () => ({
      manicure: services.filter((s) => s.category === "manicure"),
      pedicure: services.filter((s) => s.category === "pedicure"),
      other: services.filter((s) => s.category === "other"),
    }),
    [services]
  );

  const serviceOptions = useMemo(
    () => ({
      manicure: servicesByCategory.manicure.map((s) => ({
        value: String(s.id),
        label: s.name,
        price: s.price,
        duration_minutes: s.duration_minutes,
      })),
      pedicure: servicesByCategory.pedicure.map((s) => ({
        value: String(s.id),
        label: s.name,
        price: s.price,
        duration_minutes: s.duration_minutes,
      })),
      other: servicesByCategory.other.map((s) => ({
        value: String(s.id),
        label: s.name,
        price: s.price,
        duration_minutes: s.duration_minutes,
      })),
    }),
    [servicesByCategory]
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      rescheduleDate: formatDateForInput(apt.date),
      rescheduleTime: formatTimeToHHMM(apt.time),
      rescheduleDuration: apt.duration_minutes,
      services: [],
    },
  });

  useEffect(() => {
    if (servicesDuration > 0) {
      setValue("rescheduleDuration", servicesDuration, { shouldDirty: true });
    }
  }, [servicesDuration, setValue]);

  const servicesDisplay = useMemo(() => {
    const selectedOptions = (Object.keys(servicesSelected) as Array<keyof ServicesSelectionState>).flatMap((cat) =>
      servicesSelected[cat]
        .filter((v) => v && v !== "none")
        .map((v) => serviceOptions[cat].find((o) => o.value === v))
        .filter(Boolean)
    );
    return selectedOptions
      .map((o) => o?.label)
      .filter(Boolean)
      .join(", ");
  }, [servicesSelected, serviceOptions]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await rescheduleMutation.mutateAsync({
        id: apt.id,
        data: {
          date: data.rescheduleDate,
          time: data.rescheduleTime,
          duration_minutes: data.rescheduleDuration,
          services: servicesDisplay || apt.services || null,
        },
      });
      toast.success("Appointment rescheduled");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Slot unavailable");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 py-2">
      <p className="text-muted-foreground text-sm">
        Move this appointment to a new date/time. Availability will be checked.
      </p>

      <div className="grid gap-1.5">
        <Label htmlFor="r-date">New Date</Label>
        <Controller
          name="rescheduleDate"
          control={control}
          render={({ field }) => <Input id="r-date" type="date" {...field} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="r-time">New Time</Label>
          <Controller
            name="rescheduleTime"
            control={control}
            render={({ field }) => <Input id="r-time" type="time" {...field} />}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="r-dur">Duration (min)</Label>
          <Controller
            name="rescheduleDuration"
            control={control}
            render={({ field }) => (
              <Input
                id="r-dur"
                type="number"
                min={gap}
                step={gap}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </div>
      </div>

      <ServicesFormInput
        serviceOptions={serviceOptions}
        inputCountForServices={INPUT_COUNT_FOR_SERVICES}
        nameInSchema="services"
        servicesSelected={servicesSelected}
        setServicesSelected={setServicesSelected}
        setValueBySchemaName={(name, value) => {
          setValue(name as "services", value, { shouldValidate: true, shouldDirty: true });
        }}
        setServicesDuration={setServicesDuration}
        labels={{ manicure: "Manicure Service", pedicure: "Pedicure Service", other: "Other Service" }}
        placeholders={{
          manicure: "Select manicure...",
          pedicure: "Select pedicure...",
          other: "Select other service...",
        }}
        requiredMessage="Select at least one service"
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={rescheduleMutation.isPending || isSubmitting}>
          {(rescheduleMutation.isPending || isSubmitting) && <Spinner className="mr-2 h-4 w-4" />}
          Confirm Reschedule
        </Button>
      </div>
    </form>
  );
}
