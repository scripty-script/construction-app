import type { User } from "./user";

/** A user on a project's team, with when they were added. */
export type ProjectUser = User & { joinedAt: Date };
