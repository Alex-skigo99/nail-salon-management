"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Shield, Calendar, Clock } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/elements/ImageUpload";
import EditableMultiInputField from "@/components/inputs/EditableMultiInputField";
import ChangePasswordDialog from "@/components/modals/ChangePasswordDialog";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCreatedAtString } from "@/utils/dateUtils";

export default function ProfilePage() {
  const t = useTranslations("clientPage.profile");
  const { update } = useSession();
  const { data: profile, isPending } = useProfile();
  const updateProfile = useUpdateProfile();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldErrorKey, setFieldErrorKey] = useState<string | null>(null);

  const isMobile = useIsMobile();

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
    <div className={cn("space-y-6", !isMobile && "rounded-4xl border-2 border-green-100 bg-green-50/30 p-8")}>
      <h2 className="text-xl font-semibold">{t("title")}</h2>

      {/* Avatar + basic info */}
      <div className="flex items-center gap-4">
        <ImageUpload
          currentImageUrl={profile.image}
          name={profile.name}
          entityType="user-profile"
          onUpload={(key) => {
            updateProfile.mutate(
              { image: key },
              {
                onSuccess: (data) => {
                  toast.success(t("profileUpdated"));
                  update({ image: data.image });
                },
                onError: () => toast.error(t("profileUpdateError")),
              }
            );
          }}
        />
        <div className={cn("flex gap-2", isMobile ? "flex-col" : "flex-row items-end gap-6")}>
          <div>
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          {profile.isGoogleAuth && (
            <Badge variant="outline" className="mt-1 border-blue-200 bg-blue-50 text-blue-700">
              <Shield className="mr-1 h-3 w-3" />
              {t("googleAuth")}
            </Badge>
          )}
        </div>
      </div>

      {/* Editable fields */}
      <div className="max-w-md space-y-4">
        <div className={cn(!isMobile && "rounded-4xl border bg-white px-6 py-2")}>
          <EditableMultiInputField
            label={t("name")}
            value={profile.name}
            onSave={(val) => handleFieldUpdate("name", val)}
          />
        </div>
        <div className={cn(!isMobile && "rounded-4xl border bg-white px-6 py-2")}>
          <EditableMultiInputField
            label={t("email")}
            value={profile.email}
            type="email"
            onSave={(val) => handleFieldUpdate("email", val)}
            errorMessage={fieldErrorKey === "email" ? (fieldError ?? undefined) : undefined}
          />
        </div>
        <div className={cn(!isMobile && "rounded-4xl border bg-white px-6 py-2")}>
          <EditableMultiInputField
            label={t("phone")}
            value={profile.phone ?? ""}
            type="tel"
            onSave={(val) => handleFieldUpdate("phone", val)}
            placeholder={t("noPhone")}
          />
        </div>
      </div>

      {/* Change password */}
      {!profile.isGoogleAuth && (
        <Button variant="outline" onClick={() => setPasswordOpen(true)}>
          {t("changePassword")}
        </Button>
      )}

      {/* Meta info */}
      <div className={cn("flex flex-wrap gap-2 text-sm text-gray-500", !isMobile && "justify-end gap-6")}>
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {t("memberSince")}: {getCreatedAtString(profile.created_at)}
        </span>
        {profile.last_login && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t("lastLogin")}: {getCreatedAtString(profile.last_login)}
          </span>
        )}
      </div>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}
