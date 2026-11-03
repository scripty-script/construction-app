import { sql } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const projectsTable = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    projectNumber: text("project_number").notNull(),
    description: text("description"),
    totalValue: numeric("total_value", { precision: 14, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    // Project numbers are unique among live projects; a deleted project's number can be reused.
    uniqueIndex("projects_project_number_unique")
      .on(table.projectNumber)
      .where(sql`${table.deletedAt} is null`),
  ],
);
