import { useState } from "react";
import apiClient from "@/lib/api-client";
import { apiRoutes } from "@/const/apiRouts";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type EntityType = "user-profile" | "master-photo" | "product-photo";

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, entityType: EntityType, entityId?: number | string): Promise<string> => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = "Only JPEG, PNG and WebP images are allowed";
      setError(msg);
      throw new Error(msg);
    }

    if (file.size > MAX_FILE_SIZE) {
      const msg = "Image must be smaller than 5 MB";
      setError(msg);
      throw new Error(msg);
    }

    setIsUploading(true);
    try {
      // 1. Get presigned URL from API
      const { data } = await apiClient.post<PresignedUrlResponse>(apiRoutes.upload.presignedUrl, {
        entityType,
        entityId,
        contentType: file.type,
        fileName: file.name,
      });

      // 2. Upload directly to S3
      await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      return data.key;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
}
