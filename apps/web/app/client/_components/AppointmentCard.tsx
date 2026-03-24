"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, Clock, Calendar, User, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { AppointmentRetrieveOfUser } from "@/types/appointmentTypes";
import { STATUS_COLORS } from "@/types/appointmentTypes";
import { getDaysToGo, getAppointmentDateString } from "@/utils/dateUtils";

type AppointmentCardProps = {
  appointment: AppointmentRetrieveOfUser;
  onDelete: () => void;
  onCommentUpdate: (id: number, comments: string) => void;
  isMobile: boolean;
};

function getDaysToGoLabel(dateStr: string, time: string, t: ReturnType<typeof useTranslations>) {
  const diff = getDaysToGo(dateStr, time);

  if (diff < 0) return t("past");
  if (diff === 0) return t("today");
  if (diff === 1) return t("tomorrow");
  return t("daysToGo", { days: diff });
}

export default function AppointmentCard({ appointment, onDelete, onCommentUpdate, isMobile }: AppointmentCardProps) {
  const t = useTranslations("clientPage.activeAppointments");
  const [editingComment, setEditingComment] = useState(false);
  const [commentText, setCommentText] = useState(appointment.comments ?? "");

  const daysLabel = getDaysToGoLabel(appointment.date, appointment.time, t);

  const handleSaveComment = () => {
    onCommentUpdate(appointment.id, commentText);
    setEditingComment(false);
  };

  const handleCancelEdit = () => {
    setCommentText(appointment.comments ?? "");
    setEditingComment(false);
  };

  return (
    <Card className={cn("relative bg-amber-50/30 shadow", isMobile && "text-sm")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Badge className={cn(STATUS_COLORS[appointment.status], "text-xs")}>{appointment.status}</Badge>
          <span className="text-xs font-medium text-pink-600">{daysLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
          onClick={onDelete}
          title={t("deleteAppointment")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-gray-700">
          <User className="h-4 w-4 shrink-0" />
          <span>
            {t("master")}: <strong>{appointment.master_data.name}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{getAppointmentDateString(appointment.date)}</span>
          <Clock className="ml-2 h-4 w-4 shrink-0" />
          <span>
            {appointment.time?.slice(0, 5)} · {appointment.duration_minutes} {t("minutes")}
          </span>
        </div>
        {appointment.services && (
          <div className="text-gray-600">
            <span className="font-medium">{t("services")}:</span> {appointment.services}
          </div>
        )}

        {/* Comments section */}
        <div className="border-t pt-2">
          <h1 className="text-sm">{t("comments")}:</h1>
          {editingComment ? (
            <div className="space-y-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("commentPlaceholder")}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveComment} className="h-7 text-xs">
                  <Check className="mr-1 h-3 w-3" />
                  {t("save")}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 text-xs">
                  <X className="mr-1 h-3 w-3" />
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-500">
                {appointment.comments || <span className="italic">{t("commentPlaceholder")}</span>}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setEditingComment(true)}
                title={t("editComment")}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
