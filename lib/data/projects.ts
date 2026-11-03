import "server-only";

import { cache } from "react";
import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { projectsTable } from "@/drizzle/schema";
import { authenticated } from "@/lib/dal";
import type { Project } from "@/lib/types";

const PAGE_SIZE = 10;

/** One live project, deduplicated per request so the layout and page share a query. */
export const getProject = cache(
  async (id: number): Promise<Project | undefined> => {
    await authenticated();

    if (!Number.isSafeInteger(id) || id < 1) return undefined;

    const rows = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .limit(1);

    return rows[0];
  },
);

export async function getProjects({ query = "", page = 1 }) {
  await authenticated();

  // Escape LIKE wildcards so the search text is matched literally.
  const pattern = `%${query.trim().replace(/[\\%_]/g, "\\$&")}%`;
  const where = and(
    isNull(projectsTable.deletedAt),
    query.trim()
      ? or(
          ilike(projectsTable.title, pattern),
          ilike(projectsTable.projectNumber, pattern),
        )
      : undefined,
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(projectsTable)
    .where(where);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  page = Math.min(Math.max(1, Math.trunc(page)), pageCount);

  const projects = await db
    .select()
    .from(projectsTable)
    .where(where)
    .orderBy(desc(projectsTable.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return { projects, total, page, pageSize: PAGE_SIZE, pageCount };
}
