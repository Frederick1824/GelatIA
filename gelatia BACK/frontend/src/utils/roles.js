export const ROLES = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  WAITER: "WAITER",
};

export function hasRole(userRole, allowedRoles = []) {
  return allowedRoles.includes(userRole);
}
