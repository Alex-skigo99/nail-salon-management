"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { EntityAvatar, AvatarSize } from "@/components/elements/EntityAvatar";

type AvatarPopupProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  size?: AvatarSize;
};

export function AvatarPopup({ src, alt, className, size = "sm" }: AvatarPopupProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn("cursor-pointer transition-transform duration-150 hover:scale-300", className)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={alt}
      >
        <EntityAvatar src={src} alt={alt} size={size} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogContent className="flex items-center justify-center p-0" style={{ maxWidth: 384 }}>
          <div className="relative h-96 w-96 overflow-hidden rounded-lg">
            {src && <Image src={src} alt={alt} fill sizes="384px" unoptimized className="object-contain" />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
