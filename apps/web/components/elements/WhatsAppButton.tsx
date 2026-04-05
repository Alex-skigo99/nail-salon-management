"use client";

import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/utils/whatsAppUtils";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  phone: string;
  message?: string;
  className?: string;
};

export function WhatsAppButton({ phone, message = "", className }: WhatsAppButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => openWhatsApp(phone, message)}
      className={cn("cursor-pointer hover:bg-green-500 hover:text-white hover:shadow-md", className)}
    >
      WhatsApp
    </Button>
  );
}
