export enum Role {
  ADMIN = "ADMIN",
  HOMEOWNER = "HOMEOWNER",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  SUBCONTRACTOR = "SUBCONTRACTOR",
}

export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: "Admin",
  [Role.HOMEOWNER]: "Homeowner",
  [Role.PROJECT_MANAGER]: "Project Manager",
  [Role.SUBCONTRACTOR]: "Subcontractor",
};

/** Roles that can be managed from the Teams page (everyone except homeowners). */
export const teamRoles = [
  Role.ADMIN,
  Role.PROJECT_MANAGER,
  Role.SUBCONTRACTOR,
] as const;

export const teamRoleLabels = Object.fromEntries(
  teamRoles.map((role) => [role, roleLabels[role]]),
) as Record<(typeof teamRoles)[number], string>;
