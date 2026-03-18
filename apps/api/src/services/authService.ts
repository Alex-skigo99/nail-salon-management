import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import type { User } from "../types/dbSchemaTypes";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER";
}

export function generateToken(user: Pick<User, "id" | "email" | "role">): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ─────────────────────────────────────────────
// Password helpers
// ─────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// ─────────────────────────────────────────────
// User queries
// ─────────────────────────────────────────────

/** Columns safe to return to the client (no password). */
const SAFE_COLUMNS = ["id", "name", "email", "phone", "role", "image", "google_id", "last_login", "created_at"];

export type SafeUser = Omit<User, "password">;

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return knex(DB_TABLES.USERS).where({ email }).first();
}

export async function findUserById(id: string): Promise<SafeUser | undefined> {
  return knex(DB_TABLES.USERS).select(SAFE_COLUMNS).where({ id }).first();
}

export async function findUserByGoogleId(googleId: string): Promise<User | undefined> {
  return knex(DB_TABLES.USERS).where({ google_id: googleId }).first();
}

// ─────────────────────────────────────────────
// Registration (email + password)
// ─────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export async function register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ConflictError("A user with this email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const [user] = await knex(DB_TABLES.USERS)
    .insert({
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      name: input.name.trim(),
      phone: input.phone.trim(),
      role: "USER", // new registrations are always USER
    })
    .returning(SAFE_COLUMNS);

  const token = generateToken(user as SafeUser);
  return { user: user as SafeUser, token };
}

// ─────────────────────────────────────────────
// Login (email + password)
// ─────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  const user = await findUserByEmail(email.toLowerCase().trim());
  if (!user || !user.password) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Update last_login timestamp
  await knex(DB_TABLES.USERS).where({ id: user.id }).update({ last_login: knex.fn.now() });

  const token = generateToken(user);
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
}

// ─────────────────────────────────────────────
// Google OAuth  (find or create)
// ─────────────────────────────────────────────

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  image?: string;
}

export async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<{ user: SafeUser; token: string }> {
  // 1. Try to find by google_id
  let user = await findUserByGoogleId(profile.googleId);

  if (!user) {
    // 2. Try to find by email — link existing account
    user = await findUserByEmail(profile.email.toLowerCase().trim());

    if (user) {
      // Link Google ID to existing account
      await knex(DB_TABLES.USERS)
        .where({ id: user.id })
        .update({
          google_id: profile.googleId,
          image: profile.image || user.image,
          last_login: knex.fn.now(),
        });
    } else {
      // 3. Create a new user
      const [newUser] = await knex(DB_TABLES.USERS)
        .insert({
          email: profile.email.toLowerCase().trim(),
          name: profile.name,
          google_id: profile.googleId,
          image: profile.image || null,
          role: "USER",
        })
        .returning("*");
      user = newUser;
    }
  } else {
    // Update last_login
    await knex(DB_TABLES.USERS)
      .where({ id: user.id })
      .update({
        last_login: knex.fn.now(),
        image: profile.image || user.image,
      });
  }

  const token = generateToken(user!);
  const { password: _pw, ...safeUser } = user!;
  return { user: safeUser, token };
}

// ─────────────────────────────────────────────
// Custom error classes
// ─────────────────────────────────────────────

export class ConflictError extends Error {
  public statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends Error {
  public statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
