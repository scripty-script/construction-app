"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq, getTableColumns, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { authenticated } from "@/lib/dal";
import {
  CreateUserFormSchema,
  UpdateUserFormSchema,
  type UserFormState,
} from "@/lib/definitions";
import { Role } from "@/lib/enums";
import * as UserPolicy from "@/policies/user-policy";
import type { User } from "@/lib/types";

const USER_NOT_FOUND_MESSAGE = "User no longer exists.";

// Every column except the password hash, so the result matches `User`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...userColumns } = getTableColumns(usersTable);

function submittedValues(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
  };
}

async function findUser(id: number): Promise<User | undefined> {
  const rows = await db
    .select(userColumns)
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return rows[0];
}

async function emailTaken(email: string, exceptId?: number) {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      exceptId === undefined
        ? eq(usersTable.email, email)
        : and(eq(usersTable.email, email), ne(usersTable.id, exceptId)),
    )
    .limit(1);

  return rows.length > 0;
}

export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const auth = await authenticated();
  const values = submittedValues(formData);

  UserPolicy.create(auth);

  const validation = CreateUserFormSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!validation.success) {
    return { errors: z.flattenError(validation.error).fieldErrors, values };
  }

  const { name, email, role, password } = validation.data;

  if (await emailTaken(email)) {
    return { errors: { email: ["Email is already in use."] }, values };
  }

  await db.insert(usersTable).values({
    name,
    email,
    role,
    password: await bcrypt.hash(password, 10),
  });

  refresh();
  return { success: true };
}

export async function updateUser(
  id: number,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const auth = await authenticated();
  const values = submittedValues(formData);
  const user = await findUser(id);

  if (!user) {
    return { message: USER_NOT_FOUND_MESSAGE, values };
  }

  UserPolicy.update(auth, user);

  const validation = UpdateUserFormSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!validation.success) {
    return { errors: z.flattenError(validation.error).fieldErrors, values };
  }

  const { name, email, role, password } = validation.data;

  if (await emailTaken(email, id)) {
    return { errors: { email: ["Email is already in use."] }, values };
  }

  const updated = await db
    .update(usersTable)
    .set({
      name,
      email,
      // Only admins may change roles, so users cannot promote themselves.
      role: auth.role === Role.ADMIN ? role : user.role,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });

  if (updated.length === 0) {
    return { message: USER_NOT_FOUND_MESSAGE, values };
  }

  refresh();
  return { success: true };
}

export async function deleteUser(
  id: number,
): Promise<{ success?: boolean; message?: string }> {
  const auth = await authenticated();
  const user = await findUser(id);

  if (!user) {
    return { message: USER_NOT_FOUND_MESSAGE };
  }

  if (auth.id === user.id) {
    return { message: "You cannot delete your own account." };
  }

  UserPolicy.destroy(auth, user);

  await db.delete(usersTable).where(eq(usersTable.id, id));

  refresh();
  return { success: true };
}
