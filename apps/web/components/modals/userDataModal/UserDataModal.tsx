"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUsers";
import { Pencil } from "lucide-react";
import { getCreatedAtString, getAppointmentDateString } from "@/utils/dateUtils";
import { Field } from "@/components/elements/Field";
import { EntityAvatar } from "@/components/elements/EntityAvatar";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { HistoryUserApptsModal } from "@/components/modals/historyUserApptsModal/HistoryUserApptsModal";
import { AvatarPopup } from "@/components/elements/AvatarPopup";

type UserDataModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onEdit: () => void;
};

export function UserDataModal({ open, onOpenChange, userId, onEdit }: UserDataModalProps) {
  const { data: user, isLoading } = useUser(userId);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View full user information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : !user ? (
          <p className="text-muted-foreground py-8 text-center text-sm">User not found</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AvatarPopup src={user.image} alt={user.name} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{user.name}</p>
                  {user.is_google_auth && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <GoogleIcon className="size-3" />
                      Signed up with Google
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            <div className="divide-y">
              <Field label="Phone" value={user.phone} />
              <Field
                label="Role"
                value={
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                    {user.role}
                  </Badge>
                }
              />
              <Field
                label="Master"
                value={
                  user.master_data ? (
                    <span className="flex items-center gap-2">
                      <EntityAvatar src={user.master_data.image} alt={user.master_data.name} size="xs" />
                      {user.master_data.name}
                    </span>
                  ) : null
                }
              />
              <Field
                label="Appointments"
                value={String(user.appts_count)}
                title="Click to open a history of appointments"
                onClick={user.appts_count > 0 ? () => setHistoryOpen(true) : undefined}
              />
              <Field
                label="Last Appointment"
                value={user.last_appts ? getAppointmentDateString(user.last_appts) : null}
              />
              <Field label="Email Subscribed" value={user.email_subscribed ? "Yes" : "No"} />
              <Field label="Last Login" value={user.last_login ? getCreatedAtString(user.last_login) : null} />
              <Field label="Created" value={getCreatedAtString(user.created_at)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {user && (
            <Button onClick={onEdit}>
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <HistoryUserApptsModal open={historyOpen} onOpenChange={setHistoryOpen} userId={userId} userName={user?.name} />
    </Dialog>
  );
}
