import { Request, Response } from "express";
import { z } from "zod";
import * as userService from "../services/userService";

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Retrieve a list of users (ADMIN only)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to update
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
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to delete
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
 *           type: integer
 *           example: 1
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
 *         created_at:
 *           type: string
 *           format: date-time
 *     UserCreate:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - role
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
 *         phone:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
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
 */

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
  phone: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  image: z.string().nullable().optional(),
});

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
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
    const user = await userService.createUser(parsed.data);
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const user = await userService.updateUser(id, parsed.data);
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
    const id = Number(req.params.id);
    if (isNaN(id)) {
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
