"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const initials = (name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        <Avatar className={cn(sizeClasses[size], "transition-opacity group-hover:opacity-80")}>
          {currentImageUrl && <AvatarImage src={currentImageUrl} alt={name ?? "Photo"} />}
          <AvatarFallback className="bg-pink-100 text-xl text-pink-700">
            {initials || <Camera className={iconSizeClasses[size]} />}
          </AvatarFallback>
        </Avatar>

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
