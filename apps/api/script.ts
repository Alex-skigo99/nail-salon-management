import { knex } from "./src/lib/db";

async function main() {
  const insertedUser = await knex("users").insert(
    {
      name: "Sasha",
      email: "sasha.dev.dgs@gmail.com",
      password: "pas123",
    },
    ["id", "email", "name"]
  );

  console.log("Inserted user:", JSON.stringify(insertedUser, null, 2));
}

main()
  .then(async () => {
    await knex.destroy();
  })
  .catch(async (e) => {
    console.error(e);
    await knex.destroy();
    process.exit(1);
  });
