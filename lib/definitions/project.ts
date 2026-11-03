import * as z from "zod";

export const ProjectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "Title must be at least 2 characters long." })
    .max(200, { error: "Title must be at most 200 characters long." }),
  projectNumber: z
    .string()
    .trim()
    .min(1, { error: "Project number is required." })
    .max(50, { error: "Project number must be at most 50 characters long." }),
  description: z
    .string()
    .trim()
    .max(5000, { error: "Description must be at most 5000 characters long." })
    .transform((value) => value || null),
  totalValue: z.coerce
    .number({ error: "Total value must be a number." })
    .min(0, { error: "Total value cannot be negative." })
    .max(999_999_999_999.99, { error: "Total value is too large." })
    .multipleOf(0.01, { error: "Total value can have at most 2 decimals." }),
  isActive: z
    .enum(["true", "false"], { error: "Please select a valid status." })
    .transform((value) => value === "true"),
});

export type ProjectFormState =
  | {
      success?: boolean;
      message?: string;
      errors?: {
        title?: string[];
        projectNumber?: string[];
        description?: string[];
        totalValue?: string[];
        isActive?: string[];
      };
      values?: {
        title?: string;
        projectNumber?: string;
        description?: string;
        totalValue?: string;
        isActive?: string;
      };
    }
  | undefined;
