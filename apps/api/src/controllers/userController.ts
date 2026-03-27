import { Request, Response } from "express";
import { z } from "zod";
import * as userService from "../services/userService";
import { hashPassword } from "../services/authService";

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Retrieve a list of users (ADMIN only)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ["name", "appts_count", "created_asc", "created_desc", "last_appts"]
 *         description: Sort order
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: ["ADMIN", "USER"]
 *         description: Filter by role
 *       - in: query
 *         name: master_id
 *         schema:
 *           type: integer
 *         description: Filter by master_id
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserListItem'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new user (ADMIN only)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID (ADMIN only)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID ID of the user
 *     responses:
 *       200:
 *         description: A single user with master data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRetrieve'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an existing user (ADMIN only)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a user (ADMIN only)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID ID of the user to delete
 *     responses:
 *       204:
 *         description: No content (deleted)
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: ["ADMIN", "USER"]
 *           example: "USER"
 *         last_login:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *         master_id:
 *           type: integer
 *           nullable: true
 *         email_subscribed:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *     UserRetrieve:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             master_data:
 *               nullable: true
 *               oneOf:
 *                 - $ref: '#/components/schemas/Master'
 *                 - type: 'null'
 *             is_google_auth:
 *               type: boolean
 *     UserListItem:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             appts_count:
 *               type: integer
 *               example: 5
 *             last_appts:
 *               type: string
 *               format: date
 *               nullable: true
 *             is_google_auth:
 *               type: boolean
 *     UserCreate:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - role
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane@example.com"
 *         role:
 *           type: string
 *           enum: ["ADMIN", "USER"]
 *           example: "USER"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "securepass123"
 *         phone:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *         master_id:
 *           type: integer
 *           nullable: true
 *         email_subscribed:
 *           type: boolean
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: ["ADMIN", "USER"]
 *         image:
 *           type: string
 *           nullable: true
 *         master_id:
 *           type: integer
 *           nullable: true
 *         email_subscribed:
 *           type: boolean
 *         password:
 *           type: string
 *           nullable: true
 *           minLength: 8
 */

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
  password: z.string().min(8),
  phone: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  master_id: z.number().int().positive().nullable().optional(),
  email_subscribed: z.boolean().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  image: z.string().nullable().optional(),
  master_id: z.number().int().positive().nullable().optional(),
  email_subscribed: z.boolean().optional(),
  password: z.string().min(8).nullable().optional(),
});

const GetAllUsersQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["name", "appts_count", "created_asc", "created_desc", "last_appts"]).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  master_id: z.coerce.number().int().positive().optional(),
});

const UserIdParamSchema = z.object({
  id: z.uuid(),
});

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = GetAllUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const users = await userService.getAllUsers(parsed.data);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parsed = UserIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const user = await userService.getUserById(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { password, ...rest } = parsed.data;
    const hashedPassword = await hashPassword(password);
    const user = await userService.createUser({ ...rest, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parsedId = UserIdParamSchema.safeParse({ id });
    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { password, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (typeof password === "string") {
      updateData.password = await hashPassword(password);
    }
    const user = await userService.updateUser(id, updateData);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parsedId = UserIdParamSchema.safeParse({ id });
    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
