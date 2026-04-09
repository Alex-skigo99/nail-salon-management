import apiClient from "@/lib/api-client";
import { apiRoutes } from "@/const/apiRouts";

export async function fetchPresignedUrl(productId: string, file: File): Promise<{ uploadUrl: string; key: string }> {
  const { data } = await apiClient.post<{ uploadUrl: string; key: string }>(apiRoutes.upload.presignedUrl, {
    entityType: "product-photo",
    entityId: productId,
    contentType: file.type,
    fileName: file.name,
  });
  return data;
}

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
}
