"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImagePreviewProps = {
  file: File | null;
  currentImageUrl?: string | null;
  name?: string;
  onFileSelect: (file: File) => void;
  className?: string;
};

export function ImagePreview({ file, currentImageUrl, name, onFileSelect, className }: ImagePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayUrl = localPreviewUrl ?? currentImageUrl ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    e.target.value = "";
    onFileSelect(selected);
  };

  return (
    <div className={cn("relative aspect-square w-full overflow-hidden rounded-lg", className)}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {displayUrl ? (
          <div className="relative h-full w-full">
            <img src={displayUrl} alt={name ?? "Product image"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
              <span className="text-xs text-white">Change photo</span>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-900">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Add photo</span>
          </div>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
