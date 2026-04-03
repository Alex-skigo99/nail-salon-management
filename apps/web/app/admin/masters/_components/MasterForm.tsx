"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCreateMaster, useUpdateMaster } from "@/hooks/useMasters";
import type { Master } from "@/types/masterTypes";

const masterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  sorting: z.number().min(0, "Sorting must be a positive number"),
  is_booking_available: z.boolean(),
  is_new_appt_email_notification: z.boolean(),
  is_del_appt_email_notification: z.boolean(),
  is_update_appt_email_notification: z.boolean(),
  is_user_comment_appt_email_notification: z.boolean(),
  is_reschedule_appt_email_notification: z.boolean(),
});

type MasterFormValues = z.input<typeof masterSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  master?: Master | null;
};

export function MasterForm({ open, onOpenChange, master }: Props) {
  const isEditing = !!master;
  const createMaster = useCreateMaster();
  const updateMaster = useUpdateMaster();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MasterFormValues>({
    resolver: zodResolver(masterSchema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      sorting: 100,
      is_booking_available: true,
      is_new_appt_email_notification: false,
      is_del_appt_email_notification: false,
      is_update_appt_email_notification: false,
      is_user_comment_appt_email_notification: false,
      is_reschedule_appt_email_notification: false,
    },
  });

  useEffect(() => {
    if (open && isEditing && master) {
      reset({
        name: master.name,
        description: master.description ?? "",
        email: master.email ?? "",
        sorting: master.sorting,
        is_booking_available: master.is_booking_available,
        is_new_appt_email_notification: master.is_new_appt_email_notification,
        is_del_appt_email_notification: master.is_del_appt_email_notification,
        is_update_appt_email_notification: master.is_update_appt_email_notification,
        is_user_comment_appt_email_notification: master.is_user_comment_appt_email_notification,
        is_reschedule_appt_email_notification: master.is_reschedule_appt_email_notification,
      });
    } else if (open && !isEditing) {
      reset({
        name: "",
        description: "",
        email: "",
        sorting: 100,
        is_booking_available: true,
        is_new_appt_email_notification: false,
        is_del_appt_email_notification: false,
        is_update_appt_email_notification: false,
        is_user_comment_appt_email_notification: false,
        is_reschedule_appt_email_notification: false,
      });
    }
  }, [open, isEditing, master, reset]);

  const onSubmit = async (data: MasterFormValues) => {
    try {
      const submitData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        email: data.email?.trim() || null,
        sorting: data.sorting,
        is_booking_available: data.is_booking_available,
        is_new_appt_email_notification: data.is_new_appt_email_notification,
        is_del_appt_email_notification: data.is_del_appt_email_notification,
        is_update_appt_email_notification: data.is_update_appt_email_notification,
        is_user_comment_appt_email_notification: data.is_user_comment_appt_email_notification,
        is_reschedule_appt_email_notification: data.is_reschedule_appt_email_notification,
      };

      if (isEditing && master) {
        await updateMaster.mutateAsync({ id: master.id, data: submitData });
        toast.success("Master updated");
      } else {
        await createMaster.mutateAsync(submitData);
        toast.success("Master created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? "Failed to update master" : "Failed to create master");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={`${open ? "open" : "closed"}-${master?.id ?? "new"}`}
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Master" : "Add Master"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="master-name">Name</Label>
            <Input
              id="master-name"
              placeholder="Master's name"
              {...register("name")}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="master-description">Description</Label>
            <Textarea
              id="master-description"
              placeholder="Specialization, bio, etc."
              {...register("description")}
              disabled={isSubmitting}
              rows={3}
              className="resize-none"
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="master-email">Email</Label>
            <Input
              id="master-email"
              type="email"
              placeholder="master@example.com"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="master-sorting">Sorting Order</Label>
              <Input
                id="master-sorting"
                type="number"
                {...register("sorting", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.sorting && <p className="text-xs text-red-600">{errors.sorting.message}</p>}
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch
                id="master-booking"
                checked={watch("is_booking_available")}
                onCheckedChange={(checked) => setValue("is_booking_available", checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="master-booking" className="cursor-pointer">
                Available for Booking
              </Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-muted-foreground text-xs">
              Requires a valid email address above to receive notifications.
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "new-appt",
                  label: "New appointment",
                  field: "is_new_appt_email_notification" as const,
                },
                {
                  id: "del-appt",
                  label: "Cancelled appointment",
                  field: "is_del_appt_email_notification" as const,
                },
                {
                  id: "update-appt",
                  label: "Updated appointment",
                  field: "is_update_appt_email_notification" as const,
                },
                {
                  id: "comment-appt",
                  label: "Client comment",
                  field: "is_user_comment_appt_email_notification" as const,
                },
                {
                  id: "reschedule-appt",
                  label: "Rescheduled appointment",
                  field: "is_reschedule_appt_email_notification" as const,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Switch
                    id={`master-${item.id}`}
                    size="sm"
                    checked={watch(item.field)}
                    onCheckedChange={(checked) => setValue(item.field, checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor={`master-${item.id}`} className="cursor-pointer text-sm font-normal">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !watch("name").trim()}>
              {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Add Master"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
