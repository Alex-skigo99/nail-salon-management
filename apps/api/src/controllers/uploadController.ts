import { Request, Response } from "express";
import { z } from "zod";
import * as s3Service from "../services/s3Service";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * @openapi
 * /upload/presigned-url:
 *   post:
 *     summary: Get a presigned S3 URL for image upload
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresignedUrlRequest'
 *     responses:
 *       200:
 *         description: Presigned upload URL and S3 key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresignedUrlResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *
 * components:
 *   schemas:
 *     PresignedUrlRequest:
 *       type: object
 *       required:
 *         - entityType
 *         - contentType
 *         - fileName
 *       properties:
 *         entityType:
 *           type: string
 *           enum: [user-profile, master-photo]
 *         entityId:
 *           type: integer
 *           description: Required for master-photo
 *         contentType:
 *           type: string
 *           enum: [image/jpeg, image/png, image/webp]
 *         fileName:
 *           type: string
 *     PresignedUrlResponse:
 *       type: object
 *       properties:
 *         uploadUrl:
 *           type: string
 *         key:
 *           type: string
 */

const PresignedUrlSchema = z
  .object({
    entityType: z.enum(["user-profile", "master-photo"]),
    entityId: z.number().int().positive().optional(),
    contentType: z.enum(ALLOWED_CONTENT_TYPES),
    fileName: z.string().min(1).max(255),
  })
  .refine((data) => data.entityType !== "master-photo" || data.entityId !== undefined, {
    message: "entityId is required for master-photo",
    path: ["entityId"],
  });

export async function getPresignedUrl(req: Request, res: Response): Promise<void> {
  try {
    const parsed = PresignedUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { entityType, entityId, contentType, fileName } = parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user!;

    // Permission checks
    if (entityType === "master-photo" && user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const entity = entityType === "user-profile" ? "users" : "masters";
    const id = entityType === "user-profile" ? user.userId : entityId!;

    const key = s3Service.buildObjectKey(entity, id, fileName);
    const uploadUrl = await s3Service.generatePresignedPutUrl(key, contentType);

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
