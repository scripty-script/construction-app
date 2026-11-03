import "server-only";

import { forbidden } from "next/navigation";
import { Role } from "@/lib/enums";
import type { Project, User } from "@/lib/types";

/** Aborts with a 403 when denied and `shouldThrow` is set; otherwise returns `allowed`. */
function authorize(allowed: boolean, shouldThrow: boolean): boolean {
  if (!allowed && shouldThrow) {
    forbidden();
  }

  return allowed;
}

/** Whether `auth` can list projects. */
export function viewAny(auth: User, shouldThrow = true): boolean {
  return authorize(
    auth.role === Role.ADMIN || auth.role === Role.PROJECT_MANAGER,
    shouldThrow,
  );
}

/** Whether `auth` can see `project`. */
export function view(
  auth: User,
  project: Project,
  shouldThrow = true,
): boolean {
  return authorize(
    auth.role === Role.ADMIN || auth.role === Role.PROJECT_MANAGER,
    shouldThrow,
  );
}

/** Whether `auth` can create projects. */
export function create(auth: User, shouldThrow = true): boolean {
  return authorize(
    auth.role === Role.ADMIN || auth.role === Role.PROJECT_MANAGER,
    shouldThrow,
  );
}

/** Whether `auth` can edit `project`. */
export function update(
  auth: User,
  project: Project,
  shouldThrow = true,
): boolean {
  return authorize(
    auth.role === Role.ADMIN || auth.role === Role.PROJECT_MANAGER,
    shouldThrow,
  );
}

/** Whether `auth` can delete `project`. Only admins can. */
export function destroy(
  auth: User,
  project: Project,
  shouldThrow = true,
): boolean {
  return authorize(auth.role === Role.ADMIN, shouldThrow);
}
