import * as z from "zod";
import { Role } from "@/lib/enums";

const name = z
  .string()
  .min(2, { error: "Name must be at least 2 characters long." })
  .trim();

const email = z.email({ error: "Please enter a valid email." }).trim();

const role = z.enum(Role, { error: "Please select a valid role." });

const password = z
  .string()
  .min(8, { error: "Be at least 8 characters long" })
  .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
  .regex(/[0-9]/, { error: "Contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Contain at least one special character.",
  })
  .trim();

export const CreateUserFormSchema = z.object({
  name,
  email,
  role,
  password,
});

/** Same as create, but an empty password keeps the current one. */
export const UpdateUserFormSchema = z.object({
  name,
  email,
  role,
  password: z.union([z.literal(""), password]),
});

export type UserFormState =
  | {
      success?: boolean;
      message?: string;
      errors?: {
        name?: string[];
        email?: string[];
        role?: string[];
        password?: string[];
      };
      values?: {
        name?: string;
        email?: string;
        role?: string;
      };
    }
  | undefined;
