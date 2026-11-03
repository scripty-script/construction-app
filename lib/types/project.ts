import type { projectsTable } from "@/drizzle/schema";

export type Project = typeof projectsTable.$inferSelect;
