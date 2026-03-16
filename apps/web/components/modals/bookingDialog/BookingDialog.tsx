"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
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
import { Spinner } from "@/components/ui/spinner";
import { phoneSchemaRequired } from "@/components/inputs/PhoneFormInput";
import type { ServicesSelectionState } from "@/components/inputs/ServicesFormInput";
import InfoUserDialog from "@/components/modals/InfoUserDialog";
import { useServices } from "@/hooks/useServices";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queryKeys";
import type { SelectedSlot } from "@/types/appointmentTypes";
import AuthenticatedBookingForm from "@/components/modals/bookingDialog/AuthenticatedBookingForm";
import GuestBookingForm from "@/components/modals/bookingDialog/GuestBookingForm";
import GuestAccessPanel from "@/components/modals/bookingDialog/GuestAccessPanel";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: SelectedSlot | null;
  isMobile: boolean;
};

type AuthFormValues = {
  phone: string;
  rememberPhone: boolean;
  services: string[];
};

type GuestFormValues = {
  userName: string;
  phone: string;
  services: string[];
  comments?: string;
};

type FeedbackDialogState = {
  open: boolean;
  type: "error" | "info";
  title: string;
  infoText: string;
};

const INPUT_COUNT_FOR_SERVICES = {
  manicure: 1,
  pedicure: 1,
  other: 1,
} as const;

const createInitialServicesSelected = (): ServicesSelectionState => ({
  manicure: ["none"],
  pedicure: ["none"],
  other: ["none"],
});

export default function BookingDialog({ open, onOpenChange, selectedSlot, isMobile }: Props) {
  const t = useTranslations("bookingDialog");
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const userPhone = session?.user?.phone ?? null;
  const needsPhone = isAuthenticated && !userPhone;

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState<FeedbackDialogState>({
    open: false,
    type: "info",
    title: "",
    infoText: "",
  });
  const [authServicesSelected, setAuthServicesSelected] =
    useState<ServicesSelectionState>(createInitialServicesSelected);
  const [authServicesDuration, setAuthServicesDuration] = useState(0);
  const [authServicesPrice, setAuthServicesPrice] = useState(0);
  const [guestServicesSelected, setGuestServicesSelected] =
    useState<ServicesSelectionState>(createInitialServicesSelected);
  const [guestServicesDuration, setGuestServicesDuration] = useState(0);
  const [guestServicesPrice, setGuestServicesPrice] = useState(0);

  const createAppointment = useCreateAppointment();
  const { data: services = [] } = useServices();

  const serviceOptions = useMemo(
    () => ({
      manicure: services
        .filter((service) => service.category === "manicure")
        .map((service) => ({
          value: String(service.id),
          label: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes,
        })),
      pedicure: services
        .filter((service) => service.category === "pedicure")
        .map((service) => ({
          value: String(service.id),
          label: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes,
        })),
      other: services
        .filter((service) => service.category === "other")
        .map((service) => ({
          value: String(service.id),
          label: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes,
        })),
    }),
    [services]
  );

  const authFormSchema = useMemo(
    () =>
      z.object({
        phone: phoneSchemaRequired,
        rememberPhone: z.boolean(),
        services: z.array(z.string()).min(1),
      }),
    [t]
  );

  const guestFormSchema = useMemo(
    () =>
      z.object({
        userName: z.string().min(1, t("validation.nameRequired")),
        phone: phoneSchemaRequired,
        services: z.array(z.string()).min(1),
        comments: z.string().optional(),
      }),
    [t]
  );

  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      phone: "",
      rememberPhone: true,
      services: [],
    },
  });

  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      userName: "",
      phone: "",
      services: [],
      comments: "",
    },
  });

  const mapSelectedServicesToString = (selected: ServicesSelectionState) => {
    const selectedOptions = (Object.keys(selected) as Array<keyof ServicesSelectionState>).flatMap((category) =>
      selected[category]
        .filter((value) => value && value !== "none")
        .map((value) => serviceOptions[category].find((option) => option.value === value))
        .filter(Boolean)
    );

    return selectedOptions
      .map((option) => option?.label)
      .filter(Boolean)
      .join(", ");
  };

  const authServicesSelectedString = useMemo(
    () => mapSelectedServicesToString(authServicesSelected),
    [authServicesSelected, serviceOptions]
  );

  const guestServicesSelectedString = useMemo(
    () => mapSelectedServicesToString(guestServicesSelected),
    [guestServicesSelected, serviceOptions]
  );

  useEffect(() => {
    if (!open) {
      // setShowGuestForm(false);
      setFeedbackDialog((prev) => ({ ...prev, open: false }));
      setAuthServicesSelected(createInitialServicesSelected());
      setAuthServicesDuration(0);
      setAuthServicesPrice(0);
      setGuestServicesSelected(createInitialServicesSelected());
      setGuestServicesDuration(0);
      setGuestServicesPrice(0);
      authForm.reset({
        phone: "",
        rememberPhone: true,
        services: [],
      });
      guestForm.reset({
        userName: "",
        phone: "",
        services: [],
        comments: "",
      });
      return;
    }

    if (userPhone) {
      authForm.setValue("phone", userPhone);
    }
  }, [open, userPhone, authForm, guestForm]);

  const openFeedbackDialog = (type: "error" | "info", title: string, infoText: string) => {
    setFeedbackDialog({
      open: true,
      type,
      title,
      infoText,
    });
  };

  const handleAuthenticatedSubmit = authForm.handleSubmit(async (values) => {
    if (!selectedSlot || !isAuthenticated || !userId) return;

    const normalizedPhone = (values.phone || "").trim();

    try {
      await createAppointment.mutateAsync({
        master_id: selectedSlot.master.id,
        user_id: userId,
        guest_name: session?.user?.name ?? null,
        guest_phone: normalizedPhone || userPhone || null,
        need_store_phone: needsPhone ? values.rememberPhone : false,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration_minutes: authServicesDuration,
        services: authServicesSelectedString || null,
        comments: null,
        status: "new",
      });

      openFeedbackDialog("info", t("feedback.infoTitle"), t("feedback.authSuccess"));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.appointmentSuggestions] });
        openFeedbackDialog("error", t("feedback.conflictTitle"), t("feedback.conflictError"));
        return;
      }
      openFeedbackDialog("error", t("feedback.errorTitle"), t("feedback.genericError"));
    }
  });

  const handleGuestSubmit = guestForm.handleSubmit(async (values) => {
    if (!selectedSlot) return;

    try {
      await createAppointment.mutateAsync({
        master_id: selectedSlot.master.id,
        guest_name: values.userName.trim(),
        guest_phone: values.phone.trim(),
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration_minutes: guestServicesDuration,
        services: guestServicesSelectedString,
        comments: values.comments?.trim() || null,
        status: "new",
      });

      openFeedbackDialog("info", t("feedback.infoTitle"), t("feedback.guestSuccess"));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.appointmentSuggestions] });
        openFeedbackDialog("error", t("feedback.conflictTitle"), t("feedback.conflictError"));
        return;
      }
      openFeedbackDialog("error", t("feedback.errorTitle"), t("feedback.genericError"));
    }
  });

  const onFeedbackDialogClose = (dialogOpen: boolean) => {
    setFeedbackDialog((prev) => ({ ...prev, open: dialogOpen }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[95vw]" : ""}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {selectedSlot && (
          <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-4">
            <CalendarDays className="size-5 text-pink-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t("slot.byMasterDate", {
                  master: selectedSlot.master.name,
                  date: selectedSlot.date,
                })}
              </p>
              <p className="text-sm text-pink-600">{selectedSlot.time}</p>
            </div>
          </div>
        )}

        {isAuthenticated && !showGuestForm && (
          <AuthenticatedBookingForm
            form={authForm}
            needsPhone={needsPhone}
            serviceOptions={serviceOptions}
            inputCountForServices={INPUT_COUNT_FOR_SERVICES}
            servicesSelected={authServicesSelected}
            setServicesSelected={setAuthServicesSelected}
            setValueBySchemaName={(nameInSchema, value) => {
              authForm.setValue(nameInSchema as "services", value, { shouldValidate: true, shouldDirty: true });
            }}
            setServicesDuration={setAuthServicesDuration}
            setServicesPrice={setAuthServicesPrice}
            totalDuration={authServicesDuration}
            totalPrice={authServicesPrice}
            t={t}
          />
        )}

        {!isAuthenticated && !showGuestForm && (
          <GuestAccessPanel onContinueAsGuest={() => setShowGuestForm(true)} t={t} />
        )}

        {showGuestForm && (
          <GuestBookingForm
            form={guestForm}
            serviceOptions={serviceOptions}
            inputCountForServices={INPUT_COUNT_FOR_SERVICES}
            servicesSelected={guestServicesSelected}
            setServicesSelected={setGuestServicesSelected}
            setValueBySchemaName={(nameInSchema, value) => {
              guestForm.setValue(nameInSchema as "services", value, { shouldValidate: true, shouldDirty: true });
            }}
            setServicesDuration={setGuestServicesDuration}
            setServicesPrice={setGuestServicesPrice}
            totalDuration={guestServicesDuration}
            totalPrice={guestServicesPrice}
            t={t}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("buttons.close")}
          </Button>
          {isAuthenticated && !showGuestForm && (
            <Button
              className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
              onClick={handleAuthenticatedSubmit}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending && <Spinner className="mr-2 size-4" />}
              {t("buttons.confirmAppointment")}
            </Button>
          )}

          {showGuestForm && (
            <Button
              className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
              onClick={handleGuestSubmit}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending && <Spinner className="mr-2 size-4" />}
              {t("buttons.makeAppointment")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <InfoUserDialog
        open={feedbackDialog.open}
        onOpenChange={onFeedbackDialogClose}
        type={feedbackDialog.type}
        title={feedbackDialog.title}
        infoText={feedbackDialog.infoText}
      />
    </Dialog>
  );
}
