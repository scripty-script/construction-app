"use server";

import { z } from "zod";
import { and, eq, isNull, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/drizzle/db";
import { projectsTable } from "@/drizzle/schema";
import { authenticated } from "@/lib/dal";
import { ProjectFormSchema, type ProjectFormState } from "@/lib/definitions";
import * as ProjectPolicy from "@/policies/project-policy";
import type { Project } from "@/lib/types";

const PROJECT_NOT_FOUND_MESSAGE = "Project no longer exists.";
const PROJECT_NUMBER_TAKEN_MESSAGE = "Project number is already in use.";

function submittedValues(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    projectNumber: String(formData.get("projectNumber") ?? ""),
    description: String(formData.get("description") ?? ""),
    totalValue: String(formData.get("totalValue") ?? ""),
    isActive: String(formData.get("isActive") ?? ""),
  };
}

async function findProject(id: number): Promise<Project | undefined> {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
    .limit(1);

  return rows[0];
}

/** Only live projects count, so a deleted project's number can be reused. */
async function projectNumberTaken(projectNumber: string, exceptId?: number) {
  const rows = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.projectNumber, projectNumber),
        isNull(projectsTable.deletedAt),
        exceptId === undefined ? undefined : ne(projectsTable.id, exceptId),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const auth = await authenticated();
  const values = submittedValues(formData);

  ProjectPolicy.create(auth);

  const validation = ProjectFormSchema.safeParse(values);

  if (!validation.success) {
    return { errors: z.flattenError(validation.error).fieldErrors, values };
  }

  if (await projectNumberTaken(validation.data.projectNumber)) {
    return {
      errors: { projectNumber: [PROJECT_NUMBER_TAKEN_MESSAGE] },
      values,
    };
  }

  await db.insert(projectsTable).values(validation.data);

  refresh();
  return { success: true };
}

export async function updateProject(
  id: number,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const auth = await authenticated();
  const values = submittedValues(formData);
  const project = await findProject(id);

  if (!project) {
    return { message: PROJECT_NOT_FOUND_MESSAGE, values };
  }

  ProjectPolicy.update(auth, project);

  const validation = ProjectFormSchema.safeParse(values);

  if (!validation.success) {
    return { errors: z.flattenError(validation.error).fieldErrors, values };
  }

  if (await projectNumberTaken(validation.data.projectNumber, id)) {
    return {
      errors: { projectNumber: [PROJECT_NUMBER_TAKEN_MESSAGE] },
      values,
    };
  }

  const updated = await db
    .update(projectsTable)
    .set(validation.data)
    .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
    .returning({ id: projectsTable.id });

  if (updated.length === 0) {
    return { message: PROJECT_NOT_FOUND_MESSAGE, values };
  }

  refresh();
  return { success: true };
}

export async function deleteProject(
  id: number,
): Promise<{ success?: boolean; message?: string }> {
  const auth = await authenticated();
  const project = await findProject(id);

  if (!project) {
    return { message: PROJECT_NOT_FOUND_MESSAGE };
  }

  ProjectPolicy.destroy(auth, project);

  await db
    .update(projectsTable)
    .set({ deletedAt: new Date() })
    .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)));

  refresh();
  return { success: true };
}
