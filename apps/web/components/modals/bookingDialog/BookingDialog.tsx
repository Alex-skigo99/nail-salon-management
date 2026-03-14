"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import SelectInput from "@/components/inputs/SelectInput";
import { PhoneFormInput, phoneSchemaOptional, phoneSchemaRequired } from "@/components/inputs/PhoneFormInput";
import { useServices } from "@/hooks/useServices";
import { useCreateAppointment } from "@/hooks/useAppointments";
import type { Service } from "@/types/serviceTypes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: {
    id: string;
    master: {
      id: number;
      name: string;
      description?: string | null;
    };
    date: string;
    time: string;
  } | null;
  isMobile: boolean;
};

const authFormSchema = z.object({
  phone: phoneSchemaOptional,
  rememberPhone: z.boolean(),
});

const guestFormSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  phone: phoneSchemaRequired,
  serviceManicure: z.string().min(1, "Manicure service is required"),
  servicePedicure: z.string().min(1, "Pedicure service is required"),
  serviceOther: z.string().min(1, "Other service is required"),
  comments: z.string().optional(),
});

type AuthFormValues = z.input<typeof authFormSchema>;
type GuestFormValues = z.infer<typeof guestFormSchema>;

const DEFAULT_DURATION = 30;

export default function BookingDialog({ open, onOpenChange, selectedSlot, isMobile }: Props) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const userPhone = session?.user?.phone ?? null;
  const needsPhone = isAuthenticated && !userPhone;

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const createAppointment = useCreateAppointment();
  const { data: services = [] } = useServices();

  const servicesByCategory = useMemo(
    () => ({
      manicure: services.filter((service) => service.category === "manicure"),
      pedicure: services.filter((service) => service.category === "pedicure"),
      other: services.filter((service) => service.category === "other"),
    }),
    [services]
  );

  const serviceOptions = useMemo(
    () => ({
      manicure: servicesByCategory.manicure.map((service) => ({ value: String(service.id), label: service.name })),
      pedicure: servicesByCategory.pedicure.map((service) => ({ value: String(service.id), label: service.name })),
      other: servicesByCategory.other.map((service) => ({ value: String(service.id), label: service.name })),
    }),
    [servicesByCategory]
  );

  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      phone: "",
      rememberPhone: true,
    },
  });

  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      userName: "",
      phone: "",
      serviceManicure: "",
      servicePedicure: "",
      serviceOther: "",
      comments: "",
    },
  });

  const watchedGuestServices = guestForm.watch(["serviceManicure", "servicePedicure", "serviceOther"]);

  const selectedGuestServices = useMemo(() => {
    const [manicureId, pedicureId, otherId] = watchedGuestServices;

    const findService = (id: string | undefined, list: Service[]) => list.find((service) => String(service.id) === id);

    const manicure = findService(manicureId, servicesByCategory.manicure);
    const pedicure = findService(pedicureId, servicesByCategory.pedicure);
    const other = findService(otherId, servicesByCategory.other);

    const list = [manicure, pedicure, other].filter(Boolean) as Service[];
    const duration = list.reduce((total, service) => total + service.duration_minutes, 0);

    return {
      list,
      duration,
      names: list.map((service) => service.name).join(", "),
    };
  }, [watchedGuestServices, servicesByCategory]);

  useEffect(() => {
    if (!open) {
      setShowGuestForm(false);
      setRequestError(null);
      setRequestSuccess(null);
      authForm.reset({ phone: "", rememberPhone: true });
      guestForm.reset({
        userName: "",
        phone: "",
        serviceManicure: "",
        servicePedicure: "",
        serviceOther: "",
        comments: "",
      });
      return;
    }

    if (userPhone) {
      authForm.setValue("phone", userPhone);
    }
  }, [open, userPhone, authForm, guestForm]);

  const handleAuthenticatedSubmit = authForm.handleSubmit(async (values) => {
    if (!selectedSlot || !isAuthenticated || !userId) return;

    setRequestError(null);
    setRequestSuccess(null);

    const normalizedPhone = (values.phone || "").trim();

    if (needsPhone) {
      const phoneValidation = phoneSchemaRequired.safeParse(normalizedPhone);
      if (!phoneValidation.success) {
        setRequestError(phoneValidation.error.issues[0]?.message ?? "Phone is required");
        return;
      }
    }

    try {
      await createAppointment.mutateAsync({
        master_id: selectedSlot.master.id,
        user_id: userId,
        user_name: session?.user?.name ?? null,
        whatsapp_phone: normalizedPhone || userPhone || null,
        need_store_phone: needsPhone ? values.rememberPhone : false,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration_minutes: DEFAULT_DURATION,
        services: null,
        comments: null,
        status: "new",
      });

      setRequestSuccess(
        "Your registration request has been registered. You need to receive confirmation. Tip: Create an account to track your registrations."
      );
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setRequestError(
          "Unfortunately, booking for the services (duration) you selected is unavailable. Please try a different appointment time."
        );
        return;
      }
      setRequestError("Failed to create appointment. Please try again.");
    }
  });

  const handleGuestSubmit = guestForm.handleSubmit(async (values) => {
    if (!selectedSlot) return;

    setRequestError(null);
    setRequestSuccess(null);

    if (selectedGuestServices.duration <= 0) {
      setRequestError("Please choose one service in each category.");
      return;
    }

    try {
      await createAppointment.mutateAsync({
        master_id: selectedSlot.master.id,
        user_name: values.userName.trim(),
        whatsapp_phone: values.phone.trim(),
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration_minutes: selectedGuestServices.duration,
        services: selectedGuestServices.names,
        comments: values.comments?.trim() || null,
        status: "new",
      });

      setRequestSuccess(
        "Your appointment request is registered. You need to get confirmation. Tip: create an account to track your appointments"
      );
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setRequestError(
          "Unfortunately the appointment with selected services (duration) is not available. Try to choose another appointment time"
        );
        return;
      }
      setRequestError("Failed to create appointment. Please try again.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[95vw]" : ""}>
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>Confirm the slot and submit your appointment request.</DialogDescription>
        </DialogHeader>

        {selectedSlot && (
          <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-4">
            <CalendarDays className="size-5 text-pink-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedSlot.master.name} - {selectedSlot.date}
              </p>
              <p className="text-sm text-pink-600">{selectedSlot.time}</p>
            </div>
          </div>
        )}

        {isAuthenticated && !showGuestForm && (
          <div className="space-y-4">
            <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-900">Booking from your account</p>
              <p className="mt-1">This appointment will be linked to your profile.</p>
            </div>

            {needsPhone && (
              <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                <PhoneFormInput control={authForm.control} name="phone" id="auth-phone" inputClassName="rounded-xl" />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Controller
                    name="rememberPhone"
                    control={authForm.control}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                    )}
                  />
                  remember this phone for next time
                </label>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && !showGuestForm && (
          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-700">
              Log in if you have an account or sign up to view an appointment status, history and manage your
              appointments through account page
            </p>

            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <Button
                variant="ghost"
                className="px-0 text-pink-600 hover:text-pink-700"
                onClick={() => setShowGuestForm(true)}
              >
                Make appointment without registration
              </Button>
            </div>
          </div>
        )}

        {showGuestForm && (
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="guest-name">Client name</Label>
              <Input
                id="guest-name"
                placeholder="Your name"
                {...guestForm.register("userName")}
                className="rounded-xl"
              />
            </div>

            <PhoneFormInput control={guestForm.control} name="phone" id="guest-phone" inputClassName="rounded-xl" />

            <div className="space-y-3 rounded-xl border border-gray-200 p-4">
              <div className="grid gap-1.5">
                <Label>Manicure service</Label>
                <Controller
                  name="serviceManicure"
                  control={guestForm.control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onValueChange={field.onChange}
                      options={serviceOptions.manicure}
                      placeholder="Select manicure service"
                      triggerClassName="w-full cursor-pointer"
                    />
                  )}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Pedicure service</Label>
                <Controller
                  name="servicePedicure"
                  control={guestForm.control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onValueChange={field.onChange}
                      options={serviceOptions.pedicure}
                      placeholder="Select pedicure service"
                      triggerClassName="w-full cursor-pointer"
                    />
                  )}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Other service</Label>
                <Controller
                  name="serviceOther"
                  control={guestForm.control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onValueChange={field.onChange}
                      options={serviceOptions.other}
                      placeholder="Select additional service"
                      triggerClassName="w-full cursor-pointer"
                    />
                  )}
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Calculated duration:{" "}
              <span className="font-semibold text-gray-900">{selectedGuestServices.duration || 0} min</span>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="guest-comments">Comments</Label>
              <Textarea
                id="guest-comments"
                rows={3}
                placeholder="Any notes for the master"
                {...guestForm.register("comments")}
              />
            </div>
          </div>
        )}

        {guestForm.formState.errors.userName && (
          <p className="text-sm text-red-600">{guestForm.formState.errors.userName?.message}</p>
        )}

        {(guestForm.formState.errors.serviceManicure ||
          guestForm.formState.errors.servicePedicure ||
          guestForm.formState.errors.serviceOther) && (
          <p className="text-sm text-red-600">All service categories are required.</p>
        )}

        {requestError && <p className="text-sm text-red-600">{requestError}</p>}
        {requestSuccess && <p className="text-sm text-green-700">{requestSuccess}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isAuthenticated && !showGuestForm && (
            <Button
              className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
              onClick={handleAuthenticatedSubmit}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending && <Spinner className="mr-2 size-4" />}
              Confirm appointment
            </Button>
          )}

          {showGuestForm && (
            <Button
              className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
              onClick={handleGuestSubmit}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending && <Spinner className="mr-2 size-4" />}
              Make appointment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
