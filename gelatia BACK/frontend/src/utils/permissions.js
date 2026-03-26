import { ROLES } from "./roles";

export function getRoleLabel(role) {
  if (role === ROLES.OWNER) return "Owner";
  if (role === ROLES.MANAGER) return "Manager";
  if (role === ROLES.CASHIER) return "Caja";
  return role;
}

export function canManageUsers(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER;
}

export function canCreateUsers(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER;
}

export function canResetPasswords(role) {
  return role === ROLES.OWNER;
}

export function canCreateBranches(role) {
  return role === ROLES.OWNER;
}

export function canCreateFlavors(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER;
}

export function canUpdateStock(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER || role === ROLES.CASHIER;
}

export function canViewUsers(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER;
}
