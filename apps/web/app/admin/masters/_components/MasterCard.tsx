"use client";

import { useState } from "react";
import { Pencil, Trash2, Mail, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/elements/ImageUpload";
import type { Master } from "@/types/masterTypes";
import { useUpdateMaster } from "@/hooks/useMasters";
import { MasterForm } from "./MasterForm";
import { DeleteMasterDialog } from "./DeleteMasterDialog";
import { WorkingHoursSection } from "./WorkingHoursSection";
import { NotificationBadge } from "@/components/elements/NotificationBadge";

type Props = {
  master: Master;
};

export function MasterCard({ master }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateMaster = useUpdateMaster();

  const handleImageUpload = (key: string) => {
    updateMaster.mutate({ id: master.id, data: { image: key } });
  };

  return (
    <>
      <Card className="gap-3 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-1">
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <ImageUpload
                  currentImageUrl={master.image}
                  name={master.name}
                  entityType="master-photo"
                  entityId={master.id}
                  onUpload={handleImageUpload}
                  size="lg"
                />
                <div className="min-w-0">
                  <CardTitle className="truncate font-semibold">{master.name}</CardTitle>
                  {!master.is_booking_available && (
                    <Badge variant="destructive" className="mt-1 gap-1">
                      <CalendarOff className="h-3 w-3" />
                      Booking disabled
                    </Badge>
                  )}
                </div>
              </div>
              <CardAction>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditOpen(true)}
                    title="Edit master"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setDeleteOpen(true)}
                    title="Delete master"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardAction>
            </div>
            {master.description ? (
              <CardDescription className="mt-0.5 line-clamp-2 text-sm">{master.description}</CardDescription>
            ) : (
              <CardDescription className="mt-0.5 text-sm italic">No description</CardDescription>
            )}
            {master.email && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{master.email}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-sm font-semibold">Email Notifications:</div>
                  <div className="bg-muted flex flex-wrap gap-2 rounded-xl border p-2">
                    {[
                      { label: "New Appt", value: master.is_new_appt_email_notification },
                      { label: "Delete", value: master.is_del_appt_email_notification },
                      { label: "Update", value: master.is_update_appt_email_notification },
                      { label: "User comment", value: master.is_user_comment_appt_email_notification },
                      { label: "Reschedule", value: master.is_reschedule_appt_email_notification },
                    ].map((notification) => (
                      <NotificationBadge
                        key={notification.label}
                        label={notification.label}
                        isActive={notification.value}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator className="mb-1" />

        <CardContent>
          <WorkingHoursSection masterId={master.id} masterName={master.name} />
        </CardContent>
      </Card>

      <MasterForm open={editOpen} onOpenChange={setEditOpen} master={master} />
      <DeleteMasterDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        masterId={master.id}
        masterName={master.name}
      />
    </>
  );
}
