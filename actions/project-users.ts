"use server";

import { z } from "zod";
import { and, eq, isNull, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/drizzle/db";
import { projectsTable, projectUsersTable, usersTable } from "@/drizzle/schema";
import { authenticated } from "@/lib/dal";
import {
  ProjectUserFormSchema,
  type ProjectUserFormState,
} from "@/lib/definitions";
import { Role } from "@/lib/enums";
import * as ProjectPolicy from "@/policies/project-policy";
import type { Project } from "@/lib/types";

const PROJECT_NOT_FOUND_MESSAGE = "Project no longer exists.";
const USER_NOT_AVAILABLE_MESSAGE = "This user cannot be added to the team.";

async function findProject(id: number): Promise<Project | undefined> {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
    .limit(1);

  return rows[0];
}

/** Only live, non-homeowner users can join a project's team. */
async function isAssignableUser(userId: number) {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, userId),
        isNull(usersTable.deletedAt),
        ne(usersTable.role, Role.HOMEOWNER),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export async function addProjectUser(
  projectId: number,
  _prevState: ProjectUserFormState,
  formData: FormData,
): Promise<ProjectUserFormState> {
  const auth = await authenticated();
  const values = { userId: String(formData.get("userId") ?? "") };
  const project = await findProject(projectId);

  if (!project) {
    return { message: PROJECT_NOT_FOUND_MESSAGE, values };
  }

  ProjectPolicy.update(auth, project);

  const validation = ProjectUserFormSchema.safeParse(values);

  if (!validation.success) {
    return { errors: z.flattenError(validation.error).fieldErrors, values };
  }

  const { userId } = validation.data;

  if (!(await isAssignableUser(userId))) {
    return { errors: { userId: [USER_NOT_AVAILABLE_MESSAGE] }, values };
  }

  const inserted = await db
    .insert(projectUsersTable)
    .values({ projectId, userId })
    .onConflictDoNothing()
    .returning({ userId: projectUsersTable.userId });

  if (inserted.length === 0) {
    return {
      errors: { userId: ["This user is already on the team."] },
      values,
    };
  }

  refresh();
  return { success: true };
}

export async function removeProjectUser(
  projectId: number,
  userId: number,
): Promise<{ success?: boolean; message?: string }> {
  const auth = await authenticated();
  const project = await findProject(projectId);

  if (!project) {
    return { message: PROJECT_NOT_FOUND_MESSAGE };
  }

  ProjectPolicy.update(auth, project);

  const removed = await db
    .delete(projectUsersTable)
    .where(
      and(
        eq(projectUsersTable.projectId, projectId),
        eq(projectUsersTable.userId, userId),
      ),
    )
    .returning({ userId: projectUsersTable.userId });

  if (removed.length === 0) {
    return { message: "This user is no longer on the team." };
  }

  refresh();
  return { success: true };
}
