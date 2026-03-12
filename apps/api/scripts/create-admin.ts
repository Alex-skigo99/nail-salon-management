/**
 * Script to create an admin user.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts --email admin@example.com --password secret123 --name "Admin User"
 *
 * All arguments are required.
 */
import dotenv from "dotenv";
dotenv.config();

import { knex } from "../src/lib/db";
import { DB_TABLES } from "../src/constants/dbTables";
import { hashPassword } from "../src/services/authService";

interface Args {
  email: string;
  password: string;
  name: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const map: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    const value = args[i + 1];
    if (key && value) map[key] = value;
  }

  if (!map.email || !map.password || !map.name) {
    console.error("Usage: npx tsx scripts/create-admin.ts --email <email> --password <password> --name <name>");
    process.exit(1);
  }

  if (map.password.length < 8) {
    console.error("Error: Password must be at least 8 characters.");
    process.exit(1);
  }

  return { email: map.email, password: map.password, name: map.name };
}

async function main() {
  const { email, password, name } = parseArgs();

  // Check if user already exists
  const existing = await knex(DB_TABLES.USERS).where({ email: email.toLowerCase().trim() }).first();

  if (existing) {
    if (existing.role === "ADMIN") {
      console.log(`User ${email} already exists with ADMIN role. No changes made.`);
    } else {
      // Upgrade to admin
      await knex(DB_TABLES.USERS).where({ id: existing.id }).update({ role: "ADMIN" });
      console.log(`User ${email} upgraded to ADMIN role.`);
    }
  } else {
    const hashed = await hashPassword(password);
    const [user] = await knex(DB_TABLES.USERS)
      .insert({
        email: email.toLowerCase().trim(),
        password: hashed,
        name: name.trim(),
        role: "ADMIN",
      })
      .returning(["id", "email", "name", "role"]);

    console.log("Admin user created successfully:");
    console.log(user);
  }

  await knex.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
