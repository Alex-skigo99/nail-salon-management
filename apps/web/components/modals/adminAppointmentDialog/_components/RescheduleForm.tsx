"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import ServicesFormInput, { type ServicesSelectionState } from "@/components/inputs/ServicesFormInput";
import SelectInput from "@/components/inputs/SelectInput";
import { useRescheduleAppointment } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { useMasters } from "@/hooks/useMasters";
import type { AppointmentRetrieve } from "@/types/appointmentTypes";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { formatDateForInput } from "@/utils/dateUtils";
import { buildRescheduleApptMessage, openWhatsApp } from "@/utils/whatsAppUtils";
import { useSetting } from "@/hooks/useSettings";
import { SETTING_KEYS } from "@/const/setting_labels";

const INPUT_COUNT_FOR_SERVICES = { manicure: 1, pedicure: 1, other: 1 } as const;

const createInitialServicesSelected = (): ServicesSelectionState => ({
  manicure: ["none"],
  pedicure: ["none"],
  other: ["none"],
});

type RescheduleFormProps = {
  apt: AppointmentRetrieve;
  onSuccess: () => void;
  onBack: () => void;
  whatsAppMessageFlag: boolean;
  setWhatsAppMessageFlag: (flag: boolean) => void;
};

export function RescheduleForm({
  apt,
  onSuccess,
  onBack,
  whatsAppMessageFlag,
  setWhatsAppMessageFlag,
}: RescheduleFormProps) {
  const { data: services = [] } = useServices();
  const { data: masters = [] } = useMasters();
  const rescheduleMutation = useRescheduleAppointment();
  const { data: slotDurationSetting } = useSetting(SETTING_KEYS.SLOT_DURATION);
  const gap = slotDurationSetting ? Number(slotDurationSetting.value) : 30;

  const [servicesSelected, setServicesSelected] = useState<ServicesSelectionState>(createInitialServicesSelected);
  const [servicesDuration, setServicesDuration] = useState(0);

  const rescheduleSchema = z.object({
    masterId: z.number().int().positive(),
    rescheduleDate: z.string().min(1, "Date is required"),
    rescheduleTime: z.string().min(1, "Time is required"),
    rescheduleDuration: z.number().min(gap).multipleOf(gap),
    services: z.array(z.string()),
  });

  type RescheduleFormData = z.input<typeof rescheduleSchema>;

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

  const masterOptions = useMemo(() => masters.map((m) => ({ value: String(m.id), label: m.name })), [masters]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      masterId: apt.master_id,
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
          master_id: data.masterId,
          date: data.rescheduleDate,
          time: data.rescheduleTime,
          duration_minutes: data.rescheduleDuration,
          services: servicesDisplay || apt.services || null,
        },
      });
      toast.success("Appointment rescheduled");
      if (whatsAppMessageFlag) {
        const phone = apt.user_data?.phone ?? apt.guest_phone ?? null;
        if (phone) {
          openWhatsApp(
            phone,
            buildRescheduleApptMessage({
              oldDate: apt.date,
              oldTime: formatTimeToHHMM(apt.time),
              newDate: data.rescheduleDate,
              newTime: data.rescheduleTime,
            })
          );
        }
      }
      onSuccess();
    } catch {
      toast.error("Slot unavailable! Please choose another time or master.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 py-2">
      <div className="grid gap-1.5">
        <Label htmlFor="r-master">Master</Label>
        <Controller
          name="masterId"
          control={control}
          render={({ field }) => (
            <SelectInput
              value={String(field.value)}
              onValueChange={(v) => field.onChange(Number(v))}
              options={masterOptions}
              placeholder="Select master..."
              triggerClassName="w-full cursor-pointer"
            />
          )}
        />
      </div>

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

      <div className="flex items-center gap-2">
        <Checkbox
          id="reschedule-wa-checkbox"
          checked={whatsAppMessageFlag}
          onCheckedChange={(checked) => setWhatsAppMessageFlag(!!checked)}
        />
        <Label htmlFor="reschedule-wa-checkbox" className="cursor-pointer font-normal">
          Send WhatsApp message to the client
        </Label>
      </div>

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
