"use client";

import { ReactNode } from "react";

type PhoneCallLinkProps = {
  phone: string | null;
  children?: ReactNode;
};

export function PhoneCallLink({ phone, children }: PhoneCallLinkProps) {
  if (!phone) return null;

  return (
    <button
      onClick={() => (window.location.href = `tel:${phone}`)}
      className="text-sm text-blue-600 hover:underline"
      title="Click to call"
    >
      {children || phone}
    </button>
  );
}
