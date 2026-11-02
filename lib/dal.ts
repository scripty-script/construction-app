import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, deleteSession } from "@/lib/session";
import { toNumber } from "es-toolkit/compat";
import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const authenticated = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  const data = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
    })
    .from(usersTable)
    .where(eq(usersTable.id, toNumber(session.userId)))
    .limit(1);

  const user = data[0];

  if (!user) {
    await deleteSession();

    redirect("/login");
  }

  return user;
});
