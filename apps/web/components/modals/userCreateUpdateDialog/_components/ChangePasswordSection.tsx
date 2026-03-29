"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { PasswordInput } from "@/components/inputs/PasswordInput";

type ChangePasswordSectionProps = {
  value: string | null;
  onChange: (password: string | null) => void;
};

export function ChangePasswordSection({ value, onChange }: ChangePasswordSectionProps) {
  const [showFields, setShowFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    if (showFields) {
      setShowFields(false);
      setPassword("");
      setConfirm("");
      setError(null);
      onChange(null);
    } else {
      setShowFields(true);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setError(null);
    if (val.length > 0 && val.length < 8) {
      setError("Password must be at least 8 characters");
      onChange(null);
    } else if (val.length >= 8 && confirm.length > 0 && val !== confirm) {
      setError("Passwords do not match");
      onChange(null);
    } else if (val.length >= 8 && val === confirm) {
      onChange(val);
    } else {
      onChange(null);
    }
  };

  const handleConfirmChange = (val: string) => {
    setConfirm(val);
    setError(null);
    if (password.length >= 8 && val !== password) {
      setError("Passwords do not match");
      onChange(null);
    } else if (password.length >= 8 && val === password) {
      onChange(password);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="rounded-md border p-3">
      <Button
        type="button"
        variant={showFields ? "secondary" : "outline"}
        size="sm"
        onClick={handleToggle}
        className="w-full"
      >
        <KeyRound className="mr-1 h-4 w-4" />
        {showFields ? "Cancel Password Change" : "Change Password"}
      </Button>

      {showFields && (
        <div className="mt-3 grid gap-2">
          <PasswordInput
            id="new-password"
            label="New Password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Min 8 characters"
            showIcon={false}
            wrapperClassName="grid gap-1"
          />
          <PasswordInput
            id="confirm-new-password"
            label="Confirm New Password"
            value={confirm}
            onChange={(e) => handleConfirmChange(e.target.value)}
            showIcon={false}
            wrapperClassName="grid gap-1"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {value && <p className="text-xs text-green-600">Password will be updated on save</p>}
        </div>
      )}
    </div>
  );
}
