"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";

type AvatarPopupProps = {
  src: string;
  alt: string;
  className?: string;
};

export function AvatarPopup({ src, alt, className }: AvatarPopupProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-gray-200 transition-transform duration-150 hover:scale-300",
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={alt}
      >
        <Image src={src} alt={alt} fill sizes="28px" className="object-cover" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogContent className="flex items-center justify-center p-0" style={{ maxWidth: 384 }}>
          <div className="relative h-96 w-96 overflow-hidden rounded-lg">
            <Image src={src} alt={alt} fill sizes="384px" className="object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
