import * as z from "zod";

export const ProjectUserFormSchema = z.object({
  userId: z.coerce
    .number({ error: "Please select a user." })
    .int({ error: "Please select a user." })
    .positive({ error: "Please select a user." }),
});

export type ProjectUserFormState =
  | {
      success?: boolean;
      message?: string;
      errors?: {
        userId?: string[];
      };
      values?: {
        userId?: string;
      };
    }
  | undefined;
