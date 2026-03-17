"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, CircleHelp, Info, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InfoUserDialogType = "error" | "info" | "confirm" | "success";

type InfoUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  infoText: string | ReactNode;
  type: InfoUserDialogType;
  className?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  okLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const typeStyles: Record<InfoUserDialogType, { container: string; icon: string }> = {
  error: {
    container: "border-red-200 bg-red-50/70",
    icon: "text-red-600",
  },
  info: {
    container: "border-sky-200 bg-sky-50/70",
    icon: "text-sky-600",
  },
  success: {
    container: "border-emerald-200 bg-emerald-50/70",
    icon: "text-emerald-600",
  },
  confirm: {
    container: "border-amber-200 bg-amber-50/70",
    icon: "text-amber-600",
  },
};

const typeIcon: Record<InfoUserDialogType, ReactNode> = {
  error: <AlertTriangle className="size-5" aria-hidden="true" />,
  info: <Info className="size-5" aria-hidden="true" />,
  success: <CheckCircle className="size-5" aria-hidden="true" />,
  confirm: <CircleHelp className="size-5" aria-hidden="true" />,
};

/**
 * Usage example:
 * <InfoUserDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   type="confirm"
 *   title="Delete appointment"
 *   infoText={<span>This action cannot be undone.</span>}
 *   onConfirm={handleDelete}
 * />
 */
export default function InfoUserDialog({
  open,
  onOpenChange,
  title,
  infoText,
  type,
  className,
  icon,
  confirmLabel,
  cancelLabel,
  okLabel,
  onConfirm,
  onCancel,
}: InfoUserDialogProps) {
  const t = useTranslations("dialogs.infoUserDialog");

  const resolvedTitle =
    title ??
    (type === "error" ? t("defaultErrorTitle") : type === "confirm" ? t("defaultConfirmTitle") : t("defaultInfoTitle"));

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      return;
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    onOpenChange(false);
  };

  const style = typeStyles[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>{resolvedTitle}</DialogTitle>
        </DialogHeader>

        <div className={cn("flex items-start gap-3 rounded-xl border p-4", style.container)}>
          <div className={cn("mt-0.5", style.icon)}>{icon ?? typeIcon[type]}</div>
          <DialogDescription className="text-sm text-gray-800">{infoText}</DialogDescription>
        </div>

        <DialogFooter>
          {type === "confirm" && (
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel ?? t("cancel")}
            </Button>
          )}

          <Button
            variant={type === "error" ? "destructive" : "default"}
            onClick={handleConfirm}
            className={
              type === "info"
                ? "bg-sky-600 text-white hover:bg-sky-700"
                : type === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : undefined
            }
          >
            {type === "confirm" ? (confirmLabel ?? t("confirm")) : (okLabel ?? t("ok"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
