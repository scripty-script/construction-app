import type { usersTable } from "@/drizzle/schema";

/** A user that is safe to send to the client (no password hash). */
export type User = Omit<typeof usersTable.$inferSelect, "password">;
