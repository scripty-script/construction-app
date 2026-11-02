import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .trim(),
});
