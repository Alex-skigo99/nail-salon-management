/**
 * Script to create an admin user in production.
 * Usage:
 *   Set the following environment variables:
 *     - ADMIN_EMAIL
 *     - ADMIN_PASSWORD
 *     - ADMIN_NAME (optional, defaults to "admin")
 *
 *   Then run this script as part of your deployment process.
 */
import { knex } from "./lib/db";
import { DB_TABLES } from "./constants/dbTables";
import { hashPassword } from "./services/authService";

export async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "admin";

  if (!email || !password) {
    console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
    return;
  }

  try {
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
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
