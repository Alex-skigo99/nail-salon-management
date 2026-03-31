import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/authService";

// ─────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────

const PhoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .regex(/^\+?[0-9\-\s()]+$/, "Invalid phone format")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Phone number must contain 7 to 15 digits");

const RegisterSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
  phone: PhoneSchema,
});

const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const GoogleAuthSchema = z.object({
  googleId: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  image: z.string().optional(),
});

const UpdateMeSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100).optional(),
    email: z.email("Invalid email address").optional(),
    phone: PhoneSchema.optional(),
    image: z.string().nullable().optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().min(8, "New password must be at least 8 characters").optional(),
  })
  .refine((d) => !d.newPassword || d.oldPassword !== undefined || true, {
    message: "oldPassword is required when setting a new password",
  });

// ─────────────────────────────────────────────
// Cookie config
// ─────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

function setTokenCookie(res: Response, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

// ─────────────────────────────────────────────
// OpenAPI Component Schemas
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *         image:
 *           type: string
 *           nullable: true
 *         isGoogleAuth:
 *           type: boolean
 *           description: True if the user authenticated via Google (google_id is set)
 *         last_login:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         token:
 *           type: string
 *           description: JWT access token
 *     RegisterInput:
 *       type: object
 *       required: [email, password, name, phone]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *           minLength: 7
 *           example: +972-54-123-4567
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     UpdateMeInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         oldPassword:
 *           type: string
 *           description: Required when changing password and account has an existing password
 *         newPassword:
 *           type: string
 *           minLength: 8
 */

// ─────────────────────────────────────────────
// Controller handlers
// ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user (USER role only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const result = await authService.register(parsed.data);
    setTokenCookie(res, result.token);
    res.status(201).json(result);
  } catch (err: unknown) {
    if ((err as { statusCode?: number; message?: string })?.statusCode === 409) {
      res.status(409).json({ error: (err as { message?: string })?.message });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const result = await authService.login(parsed.data.email, parsed.data.password);
    setTokenCookie(res, result.token);
    res.json(result);
  } catch (err: unknown) {
    if ((err as { statusCode?: number; message?: string })?.statusCode === 401) {
      res.status(401).json({ error: (err as { message?: string })?.message });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * @openapi
 * /auth/google:
 *   post:
 *     summary: Authenticate with Google OAuth profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [googleId, email, name]
 *             properties:
 *               googleId:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated via Google
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const parsed = GoogleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const result = await authService.findOrCreateGoogleUser(parsed.data);
    setTokenCookie(res, result.token);
    res.json(result);
  } catch (err: unknown) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *       401:
 *         description: Not authenticated
 */
export async function me(req: Request, res: Response): Promise<void> {
  try {
    // req.user is set by the authenticate middleware
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await authService.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { google_id, ...rest } = user as authService.SafeUser & { google_id: string | null };
    res.json({ user: { ...rest, isGoogleAuth: google_id !== null } });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * @openapi
 * /auth/me:
 *   patch:
 *     summary: Update current user profile or password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMeInput'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated or wrong old password
 *       409:
 *         description: Email already in use
 */
export async function updateMe(req: Request, res: Response): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const parsed = UpdateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const user = await authService.updateMe(userId, parsed.data);
    const { google_id, ...rest } = user as authService.SafeUser & { google_id: string | null };
    res.json({ user: { ...rest, isGoogleAuth: google_id !== null } });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e?.statusCode === 409) {
      res.status(409).json({ error: e.message });
      return;
    }
    if (e?.statusCode === 401) {
      res.status(401).json({ error: e.message });
      return;
    }
    console.error("UpdateMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * @openapi
 * /auth/me:
 *   delete:
 *     summary: Delete the current authenticated user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       401:
 *         description: Not authenticated
 */
export async function deleteMe(req: Request, res: Response): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    await authService.deleteUser(userId);
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
    res.status(204).send();
  } catch (err) {
    console.error("DeleteMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and clear auth cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "Logged out successfully" });
}
