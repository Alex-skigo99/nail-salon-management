"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useUserAppointments, useDeleteAppointment, useUpdateAppointmentComment } from "@/hooks/useAppointments";
import { Spinner } from "@/components/ui/spinner";
import InfoUserDialog from "@/components/modals/InfoUserDialog";
import AppointmentCard from "./AppointmentCard";

type ActiveAppointmentsProps = {
  isMobile: boolean;
};

export default function ActiveAppointments({ isMobile }: ActiveAppointmentsProps) {
  const { data: session } = useSession();
  const t = useTranslations("clientPage.activeAppointments");
  const userId = session?.user?.id;

  const today = new Date().toISOString().split("T")[0];

  const { data, isPending } = useUserAppointments(userId, {
    from: today,
    page: 1,
    perPage: 50,
  });
  const deleteAppointment = useDeleteAppointment();
  const updateComment = useUpdateAppointmentComment();

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const appointments = data?.data ?? [];

  const handleDelete = () => {
    if (deleteId === null) return;
    deleteAppointment.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"));
        setDeleteId(null);
      },
      onError: () => {
        toast.error(t("deleteError"));
        setDeleteId(null);
      },
    });
  };

  const handleCommentUpdate = (id: number, comments: string) => {
    updateComment.mutate(
      { id, comments },
      {
        onSuccess: () => toast.success(t("commentUpdated")),
        onError: () => toast.error(t("commentUpdateError")),
      }
    );
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">{t("noAppointments")}</p>
      ) : (
        <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onDelete={() => setDeleteId(appointment.id)}
              onCommentUpdate={handleCommentUpdate}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      <InfoUserDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        type="confirm"
        title={t("deleteConfirmTitle")}
        infoText={t("deleteConfirmText")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
