import { execSync } from "child_process";

export const handler = async () => {
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
    });

    return {
      statusCode: 200,
      body: "Migration successful",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
