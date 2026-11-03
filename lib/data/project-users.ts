import "server-only";

import { and, asc, eq, getTableColumns, isNull, ne, notExists } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { projectUsersTable, usersTable } from "@/drizzle/schema";
import { authenticated } from "@/lib/dal";
import { Role } from "@/lib/enums";
import type { ProjectUser, User } from "@/lib/types";

// Every column except the password hash, so the result matches `User`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...userColumns } = getTableColumns(usersTable);

/** Live users on the project's team, in the order they were added. */
export async function getProjectUsers(
  projectId: number,
): Promise<ProjectUser[]> {
  await authenticated();

  return db
    .select({ ...userColumns, joinedAt: projectUsersTable.createdAt })
    .from(projectUsersTable)
    .innerJoin(usersTable, eq(usersTable.id, projectUsersTable.userId))
    .where(
      and(
        eq(projectUsersTable.projectId, projectId),
        isNull(usersTable.deletedAt),
      ),
    )
    .orderBy(asc(projectUsersTable.createdAt));
}

/** Live, non-homeowner users who are not on the project's team yet. */
export async function getAvailableProjectUsers(
  projectId: number,
): Promise<User[]> {
  await authenticated();

  return db
    .select(userColumns)
    .from(usersTable)
    .where(
      and(
        isNull(usersTable.deletedAt),
        ne(usersTable.role, Role.HOMEOWNER),
        notExists(
          db
            .select({ userId: projectUsersTable.userId })
            .from(projectUsersTable)
            .where(
              and(
                eq(projectUsersTable.projectId, projectId),
                eq(projectUsersTable.userId, usersTable.id),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(usersTable.name));
}
