import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

const s3 = new S3Client({
  ...(process.env.AWS_ENDPOINT_URL
    ? {
        endpoint: process.env.AWS_ENDPOINT_URL,
        forcePathStyle: true,
        region: process.env.AWS_REGION || "us-east-1",
        credentials: { accessKeyId: "test", secretAccessKey: "test" },
      }
    : {}),
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
const BUCKET = process.env.S3_BUCKET_NAME || "";

const PUT_URL_EXPIRES_IN = 5 * 60; // 5 minutes
const GET_URL_EXPIRES_IN = 24 * 60 * 60; // 24 hours

export function buildObjectKey(entity: string, entityId: string | number, fileName: string): string {
  const ext = path.extname(fileName).toLowerCase() || ".jpg";
  const randomId = crypto.randomBytes(4).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  return `${entity}/${entityId}/${timestamp}-${randomId}${ext}`;
}

export async function generatePresignedPutUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: PUT_URL_EXPIRES_IN });
}

export async function generatePresignedGetUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: GET_URL_EXPIRES_IN });
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3.send(command);
}

/**
 * Resolve an image value to a URL:
 * - null/undefined → null
 * - starts with "http" → return as-is (external URL, e.g. Google profile)
 * - otherwise → treat as S3 key, generate presigned GET URL
 */
export async function resolveImageUrl(imageValue: string | null | undefined): Promise<string | null> {
  if (!imageValue) return null;
  if (imageValue.startsWith("http")) return imageValue;
  return generatePresignedGetUrl(imageValue);
}

/**
 * Check if an image value is an S3 key (not an external URL).
 */
export function isS3Key(imageValue: string | null | undefined): boolean {
  if (!imageValue) return false;
  return !imageValue.startsWith("http");
}
