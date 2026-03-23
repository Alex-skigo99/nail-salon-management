"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Shield, Calendar, Clock } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditableMultiInputField from "./EditableMultiInputField";
import { AxiosError } from "axios";

// Check if avatar component exists - let me handle it gracefully
function UserAvatar({ name, image }: { name: string; image: string | null }) {
  const initials = (name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className="h-20 w-20">
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className="bg-pink-100 text-xl text-pink-700">{initials}</AvatarFallback>
    </Avatar>
  );
}

export default function ProfilePage() {
  const t = useTranslations("clientPage.profile");
  const { data: profile, isPending } = useProfile();
  const updateProfile = useUpdateProfile();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldErrorKey, setFieldErrorKey] = useState<string | null>(null);

  const handleFieldUpdate = (field: string, value: string) => {
    setFieldError(null);
    setFieldErrorKey(null);

    updateProfile.mutate(
      { [field]: value },
      {
        onSuccess: () => toast.success(t("profileUpdated")),
        onError: (err) => {
          const axiosErr = err as AxiosError;
          if (field === "email" && axiosErr.response?.status === 409) {
            setFieldError(t("emailInUse"));
            setFieldErrorKey("email");
          } else {
            toast.error(t("profileUpdateError"));
          }
        },
      }
    );
  };

  if (isPending || !profile) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>

      {/* Avatar + basic info */}
      <div className="flex items-center gap-4">
        <UserAvatar name={profile.name} image={profile.image} />
        <div>
          <h3 className="text-lg font-semibold">{profile.name}</h3>
          <p className="text-sm text-gray-500">{profile.email}</p>
          {profile.isGoogleAuth && (
            <Badge variant="outline" className="mt-1 border-blue-200 bg-blue-50 text-blue-700">
              <Shield className="mr-1 h-3 w-3" />
              {t("googleAuth")}
            </Badge>
          )}
        </div>
      </div>

      {/* Editable fields */}
      <div className="max-w-md space-y-4 rounded-lg border p-4">
        <EditableMultiInputField
          label={t("name")}
          value={profile.name}
          onSave={(val) => handleFieldUpdate("name", val)}
        />
        <EditableMultiInputField
          label={t("email")}
          value={profile.email}
          type="email"
          onSave={(val) => handleFieldUpdate("email", val)}
          errorMessage={fieldErrorKey === "email" ? (fieldError ?? undefined) : undefined}
        />
        <EditableMultiInputField
          label={t("phone")}
          value={profile.phone ?? ""}
          type="tel"
          onSave={(val) => handleFieldUpdate("phone", val)}
          placeholder={t("noPhone")}
        />
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {t("memberSince")}: {new Date(profile.created_at).toLocaleDateString()}
        </span>
        {profile.last_login && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t("lastLogin")}: {new Date(profile.last_login).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Change password */}
      {!profile.isGoogleAuth && (
        <Button variant="outline" onClick={() => setPasswordOpen(true)}>
          {t("changePassword")}
        </Button>
      )}

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}

// ─── Change Password Dialog ───────────────────────────

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

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
    // Handle refine messages as translation keys
    if (msg === "passwordMismatch") return t("passwordMismatch");
    return msg;
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
            {getErrorMessage("oldPassword") && <p className="text-xs text-red-600">{getErrorMessage("oldPassword")}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword">{t("newPassword")}</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {getErrorMessage("newPassword") && <p className="text-xs text-red-600">{getErrorMessage("newPassword")}</p>}
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
