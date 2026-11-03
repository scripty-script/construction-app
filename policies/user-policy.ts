import "server-only";

import { forbidden } from "next/navigation";
import { Role } from "@/lib/enums";
import type { User } from "@/lib/types";

// Import as a namespace, Laravel style: `import * as UserPolicy from "@/policies/user-policy"`
// then call `UserPolicy.viewAny(auth)`, `UserPolicy.destroy(auth, user)`, etc.

/** Aborts with a 403 when denied and `shouldThrow` is set; otherwise returns `allowed`. */
function authorize(allowed: boolean, shouldThrow: boolean): boolean {
  if (!allowed && shouldThrow) {
    forbidden();
  }

  return allowed;
}

/** Whether `auth` can list users. */
export function viewAny(auth: User, shouldThrow = true): boolean {
  return authorize(
    auth.role === Role.ADMIN || auth.role === Role.PROJECT_MANAGER,
    shouldThrow,
  );
}

/** Whether `auth` can see `user`. */
export function view(auth: User, user: User, shouldThrow = true): boolean {
  return authorize(viewAny(auth, false) || auth.id === user.id, shouldThrow);
}

/** Whether `auth` can create users. */
export function create(auth: User, shouldThrow = true): boolean {
  return authorize(auth.role === Role.ADMIN, shouldThrow);
}

/** Whether `auth` can edit `user`. */
export function update(auth: User, user: User, shouldThrow = true): boolean {
  return authorize(
    auth.role === Role.ADMIN || auth.id === user.id,
    shouldThrow,
  );
}

/** Whether `auth` can delete `user`. Nobody can delete themselves. */
export function destroy(
  auth: User,
  user: User,
  shouldThrow = true,
): boolean {
  return authorize(
    auth.role === Role.ADMIN && auth.id !== user.id,
    shouldThrow,
  );
}
