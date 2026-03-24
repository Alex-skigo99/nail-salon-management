"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUpdateProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("clientPage.profile");
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormValues) => {
    updateProfile.mutate(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success(t("passwordChanged"));
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          const axiosErr = err as AxiosError;
          if (axiosErr.response?.status === 401) {
            setError("oldPassword", { message: t("wrongOldPassword") });
          } else {
            toast.error(t("passwordChangeError"));
          }
        },
      }
    );
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const getErrorMessage = (field: keyof PasswordFormValues) => {
    const msg = errors[field]?.message;
    if (!msg) return undefined;
    if (msg === "passwordMismatch") return t("passwordMismatch");
    return msg as string | undefined;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("changePassword")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="oldPassword">{t("oldPassword")}</Label>
            <Input id="oldPassword" type="password" {...register("oldPassword")} />
            {getErrorMessage("oldPassword") && (
              <p className="text-xs text-red-600">{getErrorMessage("oldPassword")}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword">{t("newPassword")}</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {getErrorMessage("newPassword") && (
              <p className="text-xs text-red-600">{getErrorMessage("newPassword")}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {getErrorMessage("confirmPassword") && (
              <p className="text-xs text-red-600">{getErrorMessage("confirmPassword")}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {t("cancel") ?? "Cancel"}
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {t("changePassword")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
