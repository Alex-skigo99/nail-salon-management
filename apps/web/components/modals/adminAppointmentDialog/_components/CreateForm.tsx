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
import SelectInput from "@/components/inputs/SelectInput";
import ServicesFormInput, { type ServicesSelectionState } from "@/components/inputs/ServicesFormInput";
import SearchUserInput from "@/components/inputs/SearchUserInput";
import { PhoneFormInput, phoneSchemaOptional } from "@/components/inputs/PhoneFormInput";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { useUsers } from "@/hooks/useUsers";
import { APPOINTMENT_STATUSES } from "@/types/appointmentTypes";
import type { Slot } from "@/types/appointmentTypes";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { useSetting } from "@/hooks/useSettings";
import { SETTING_KEYS } from "@/const/setting_labels";
import { buildCreateApptMessage, openWhatsApp } from "@/utils/whatsAppUtils";

const INPUT_COUNT_FOR_SERVICES = { manicure: 1, pedicure: 1, other: 1 } as const;

const createInitialServicesSelected = (): ServicesSelectionState => ({
  manicure: ["none"],
  pedicure: ["none"],
  other: ["none"],
});

type CreateFormProps = {
  slot: Slot;
  date: string;
  masterId: number;
  onSuccess: () => void;
  whatsAppMessageFlag: boolean;
  setWhatsAppMessageFlag: (flag: boolean) => void;
};

export function CreateForm({
  slot,
  date,
  masterId,
  onSuccess,
  whatsAppMessageFlag,
  setWhatsAppMessageFlag,
}: CreateFormProps) {
  const { data: services = [] } = useServices();
  const { data: usersResponse } = useUsers();
  const users = usersResponse?.data ?? [];
  const createMutation = useCreateAppointment();
  const { data: slotDurationSetting } = useSetting(SETTING_KEYS.SLOT_DURATION);
  const gap = slotDurationSetting ? Number(slotDurationSetting.value) : 30;

  const [servicesSelected, setServicesSelected] = useState<ServicesSelectionState>(createInitialServicesSelected);
  const [servicesDuration, setServicesDuration] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const createSchema = z
    .object({
      userId: z.uuid().nullable().optional(),
      userName: z.string().optional(),
      phone: phoneSchemaOptional,
      services: z.array(z.string()),
      comments: z.string().optional(),
      status: z.enum(APPOINTMENT_STATUSES),
      duration: z.number().min(gap).multipleOf(gap),
    })
    .refine((data) => !!data.userId || (data.userName?.trim() ?? "").length > 0, {
      message: "Client name is required when no user is selected",
      path: ["userName"],
    });

  type CreateFormData = z.input<typeof createSchema>;

  const initSchemaValues: CreateFormData = {
    userId: null,
    userName: "",
    phone: "",
    services: [],
    comments: "",
    status: "new",
    duration: gap,
  };

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
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: initSchemaValues,
  });

  useEffect(() => {
    if (servicesDuration > 0) {
      setValue("duration", servicesDuration, { shouldDirty: true });
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

  const handlePreset = (name: "Lunch" | "Reserved") => {
    setValue("userName", name, { shouldDirty: true });
    setValue("status", "reserved", { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        master_id: masterId,
        date,
        time: formatTimeToHHMM(slot.start_time),
        duration_minutes: data.duration,
        user_id: userId ?? null,
        guest_name: userId ? null : data.userName || null,
        guest_phone: userId ? null : data.phone || null,
        services: servicesDisplay || null,
        comments: data.comments || null,
        status: data.status,
      });
      toast.success("Appointment created");
      if (whatsAppMessageFlag) {
        const phone = userId ? (users.find((u) => u.id === userId)?.phone ?? null) : data.phone || null;
        if (phone) {
          openWhatsApp(
            phone,
            buildCreateApptMessage({
              date,
              time: formatTimeToHHMM(slot.start_time),
              duration: data.duration,
              services: servicesDisplay || "",
              lang: users.find((u) => u.id === userId)?.language || "en",
            })
          );
        }
      }
      onSuccess();
    } catch {
      toast.error("Failed to create appointment. Please try again.");
    } finally {
      setServicesSelected(createInitialServicesSelected());
      setServicesDuration(0);
      setUserId(null);
      reset(initSchemaValues);
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
              <Label htmlFor="create-userName">Guest Client Name</Label>
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
              render={({ field }) => <Input id="create-userName" {...field} placeholder="John Doe" />}
            />
            {errors.userName && <p className="text-destructive text-xs">{errors.userName.message}</p>}
          </div>

          <PhoneFormInput
            control={control}
            name="phone"
            id="create-phone"
            label="Guest Client Phone"
            placeholder="+1234567890"
          />
        </>
      )}

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

      <div className="grid gap-1.5">
        <Label htmlFor="create-comments">Comments</Label>
        <Controller
          name="comments"
          control={control}
          render={({ field }) => <Input id="create-comments" {...field} placeholder="Any notes" />}
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
          <Label htmlFor="create-duration">Duration (min)</Label>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Input
                id="create-duration"
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

      <div className="flex items-center gap-2">
        <Checkbox
          id="create-wa-checkbox"
          checked={whatsAppMessageFlag}
          onCheckedChange={(checked) => setWhatsAppMessageFlag(!!checked)}
        />
        <Label htmlFor="create-wa-checkbox" className="cursor-pointer font-normal">
          Send WhatsApp message to the client
        </Label>
      </div>

      <Button type="submit" disabled={createMutation.isPending || isSubmitting} className="mt-1">
        {(createMutation.isPending || isSubmitting) && <Spinner className="mr-2 h-4 w-4" />}
        Create
      </Button>
    </form>
  );
}
