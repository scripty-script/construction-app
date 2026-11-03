import { seedUsers } from "./users";

async function main() {
  await seedUsers();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
