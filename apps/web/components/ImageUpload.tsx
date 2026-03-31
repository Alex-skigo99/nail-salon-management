"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { EntityAvatar } from "@/components/elements/EntityAvatar";
import { Spinner } from "@/components/ui/spinner";
import { useImageUpload, EntityType } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

type Props = {
  currentImageUrl?: string | null;
  name?: string;
  entityType: EntityType;
  entityId?: number;
  onUpload: (key: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function ImageUpload({ currentImageUrl, name, entityType, entityId, onUpload, className, size = "md" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    try {
      const key = await upload(file, entityType, entityId);
      onUpload(key);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="group relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <EntityAvatar
          src={currentImageUrl}
          alt={name ?? "Photo"}
          className={cn(sizeClasses[size], "transition-opacity group-hover:opacity-80")}
        />

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Spinner className="h-5 w-5 text-white" />
          ) : (
            <Camera className={cn(iconSizeClasses[size], "text-white")} />
          )}
        </div>

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
            <Spinner className="h-5 w-5 text-white" />
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
