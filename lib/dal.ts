import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { toNumber } from "es-toolkit/compat";
import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { eq, getTableColumns } from "drizzle-orm";
import type { User } from "@/lib/types";

// Every column except the password hash, so the result matches `User`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...userColumns } = getTableColumns(usersTable);

export const authenticated = cache(async (): Promise<User> => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  const data = await db
    .select(userColumns)
    .from(usersTable)
    .where(eq(usersTable.id, toNumber(session.userId)))
    .limit(1);

  const user = data[0];

  if (!user) {
    // Can't delete cookies while rendering; let the Route Handler do it.
    redirect("/session/invalidate");
  }

  return user;
});
