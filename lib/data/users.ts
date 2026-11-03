import "server-only";

import {
  and,
  count,
  desc,
  getTableColumns,
  ilike,
  isNull,
  ne,
  or,
} from "drizzle-orm";
import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { authenticated } from "@/lib/dal";
import { Role } from "@/lib/enums";

// Every column except the password hash, so the result matches `User`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...userColumns } = getTableColumns(usersTable);

const PAGE_SIZE = 10;

export async function getUsers({ query = "", page = 1 }) {
  await authenticated();

  // Escape LIKE wildcards so the search text is matched literally.
  const pattern = `%${query.trim().replace(/[\\%_]/g, "\\$&")}%`;
  const where = and(
    isNull(usersTable.deletedAt),
    ne(usersTable.role, Role.HOMEOWNER),
    query.trim()
      ? or(ilike(usersTable.name, pattern), ilike(usersTable.email, pattern))
      : undefined,
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(usersTable)
    .where(where);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  page = Math.min(Math.max(1, Math.trunc(page)), pageCount);

  const users = await db
    .select(userColumns)
    .from(usersTable)
    .where(where)
    .orderBy(desc(usersTable.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return { users, total, page, pageSize: PAGE_SIZE, pageCount };
}
