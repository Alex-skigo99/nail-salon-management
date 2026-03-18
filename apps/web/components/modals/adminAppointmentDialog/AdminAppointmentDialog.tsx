"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useDeleteAppointment } from "@/hooks/useAppointments";
import type { Slot } from "@/types/appointmentTypes";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { CreateForm } from "./_components/CreateForm";
import { UpdateForm } from "./_components/UpdateForm";
import { RescheduleForm } from "./_components/RescheduleForm";

type View = "main" | "reschedule" | "delete";

type AdminAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: Slot | null;
  date: string;
  masterId: number;
};

export function AdminAppointmentDialog({ open, onOpenChange, slot, date, masterId }: AdminAppointmentDialogProps) {
  const isExisting = !!slot?.appointment_data;
  const apt = slot?.appointment_data;

  const [view, setView] = useState<View>("main");
  const deleteMutation = useDeleteAppointment();

  const handleClose = () => {
    setView("main");
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setView("main");
    onOpenChange(isOpen);
  };

  const handleDelete = async () => {
    if (!apt) return;
    try {
      await deleteMutation.mutateAsync(apt.id);
      toast.success("Appointment deleted");
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to delete");
    } finally {
      setView("main");
    }
  };

  const title = isExisting ? "Edit Appointment" : "New Appointment";
  const description = isExisting
    ? "Update appointment details, reschedule, or delete."
    : "Fill in details to book this slot.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view === "reschedule" ? "Reschedule Appointment" : title}
            {slot && (
              <span className="text-muted-foreground text-sm font-normal">
                {date} · {formatTimeToHHMM(slot.start_time)}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {view === "reschedule"
              ? "Move this appointment to a new date/time."
              : view === "delete"
                ? "This action cannot be undone."
                : description}
          </DialogDescription>
        </DialogHeader>

        {/* Create */}
        {!isExisting && view === "main" && (
          <CreateForm slot={slot} date={date} masterId={masterId} onSuccess={handleClose} />
        )}

        {/* Update */}
        {isExisting && apt && view === "main" && (
          <UpdateForm
            apt={apt}
            onSuccess={handleClose}
            onReschedule={() => setView("reschedule")}
            onDelete={() => setView("delete")}
          />
        )}

        {/* Reschedule */}
        {isExisting && apt && view === "reschedule" && (
          <RescheduleForm apt={apt} slot={slot} date={date} onSuccess={handleClose} onBack={() => setView("main")} />
        )}

        {/* Delete confirmation */}
        {view === "delete" && (
          <>
            <div className="py-4 text-center">
              <p className="text-destructive font-medium">Are you sure you want to delete this appointment?</p>
              <p className="text-muted-foreground mt-1 text-sm">This action cannot be undone.</p>
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setView("main")}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                Confirm Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
