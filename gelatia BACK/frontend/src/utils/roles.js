export const ROLES = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
};

export function hasRole(userRole, allowedRoles = []) {
  return allowedRoles.includes(userRole);
}
