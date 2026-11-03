import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  projectsTable: {
    users: r.many.usersTable({
      from: r.projectsTable.id.through(r.projectUsersTable.projectId),
      to: r.usersTable.id.through(r.projectUsersTable.userId),
    }),
  },
  usersTable: {
    projects: r.many.projectsTable({
      from: r.usersTable.id.through(r.projectUsersTable.userId),
      to: r.projectsTable.id.through(r.projectUsersTable.projectId),
    }),
  },
}));
