"use server";
import { z } from "zod";
import {
  SignupFormSchema,
  SignupFormState,
  LoginFormSchema,
} from "@/lib/definitions";
import bcrypt from "bcryptjs";
import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";

export async function login(prevState: any, formData: FormData) {
  const validation = LoginFormSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    return {
      errors: z.flattenError(validation.error).fieldErrors,
      email: String(formData.get("email") ?? ""),
    };
  }

  const { email, password } = validation.data;

  const data = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)))
    .limit(1);

  const user = data[0];

  if (!user) {
    return {
      errors: {
        email: "Incorrect email or password",
      },
      email,
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return {
      errors: {
        email: "Incorrect email or password",
      },
      email,
    };
  }

  await createSession(String(user.id));
  redirect("/dashboard");
}

export async function signup(prevState: SignupFormState, formData: FormData) {
  const validation = SignupFormSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    return {
      errors: z.flattenError(validation.error).fieldErrors,
      name: String(formData.get("name")),
      email: String(formData.get("email")),
    };
  }

  const { name, email, password } = validation.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const data = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning({ id: usersTable.id });

  const user = data[0];
  if (!user) {
    return {
      message: "An error occurred while creating your account.",
    };
  }

  await createSession(String(user.id));
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
