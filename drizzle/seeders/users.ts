import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { Role } from "@/lib/enums";

export async function seedUsers() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;

  if (!email || !password) {
    throw new Error("SEED_USER_EMAIL and SEED_USER_PASSWORD must be set in .env");
  }

  const [existingUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await seed(db, { usersTable }).refine((functions) => ({
    usersTable: {
      count: 1,
      columns: {
        name: functions.default({ defaultValue: "Admin" }),
        email: functions.default({ defaultValue: email }),
        password: functions.default({ defaultValue: hashedPassword }),
        role: functions.default({ defaultValue: Role.ADMIN }),
        createdAt: functions.default({ defaultValue: new Date() }),
        updatedAt: functions.default({ defaultValue: new Date() }),
      },
    },
  }));

  console.log(`Seeded user ${email}.`);
}
