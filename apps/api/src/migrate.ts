import { knex } from "./lib/db";

export const handler = async () => {
  try {
    await knex.migrate.latest();

    return {
      statusCode: 200,
      body: "Migration successful",
    };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await knex.destroy();
  }
};
