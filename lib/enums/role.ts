export enum Role {
  ADMIN = "ADMIN",
  HOMEOWNER = "HOMEOWNER",
  PROJECT_MANAGER = "PROJECT_MANAGER",
}

export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: "Admin",
  [Role.HOMEOWNER]: "Homeowner",
  [Role.PROJECT_MANAGER]: "Project Manager",
};
