"use client";

import { Settings } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import EditableMultiInputField from "@/components/inputs/EditableMultiInputField";
import { toast } from "sonner";
import { getCreatedAtString } from "@/utils/dateUtils";
import { useState } from "react";

export default function SettingsPage() {
  const { data: settings, isLoading, error } = useSettings();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const updateSetting = useUpdateSetting();

  const handleSave = (key: string, value: string, validation: (value: string | number) => string | null) => {
    const error = validation(value);
    if (error) {
      setErrorMessage(error);
      setErrorKey(key);
      return;
    }
    setErrorMessage(null);
    setErrorKey(null);
    updateSetting.mutate(
      { key, value },
      {
        onSuccess: () => {
          toast.success(`"${key}" has been updated successfully.`);
        },
        onError: () => {
          toast.error("Failed to update setting.");
        },
      }
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Page header */}
      <div className="border-b px-3 py-3 md:px-6 md:py-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage salon configuration</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-2 py-3 md:p-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-destructive font-medium">Failed to load settings</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {settings?.map((setting) => {
              return (
                <div key={setting.key} className="w-xl rounded-lg border p-4">
                  <EditableMultiInputField
                    label={setting.label}
                    value={setting.value}
                    type={setting.type}
                    inputClassName="font-bold text-primary"
                    onSave={(value) => handleSave(setting.key, value, setting.validation)}
                    placeholder={setting.description ?? undefined}
                    errorMessage={errorKey === setting.key ? (errorMessage ?? undefined) : undefined}
                  />
                  {setting.description && <p className="text-muted-foreground mt-1 text-xs">{setting.description}</p>}
                  {setting.updated_at && (
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      Last updated: {getCreatedAtString(setting.updated_at)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
