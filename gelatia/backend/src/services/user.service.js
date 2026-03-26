const { hashPassword } = require("../lib/auth");
const { BadRequestError, ConflictError, ForbiddenError, NotFoundError } = require("../lib/errors");
const { ROLES } = require("../lib/roles");
const { buildSearchResponse, parseSearchParams } = require("../lib/search");
const { parseEmail, parsePositiveInt, parseRequiredString } = require("../lib/validation");
const userRepository = require("../repositories/user.repository");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    createdAt: user.createdAt,
  };
}

function validateTargetRole(role) {
  if (!Object.values(ROLES).includes(role)) {
    throw new BadRequestError("role invalido");
  }
}

function assertCanCreateRole(actorRole, targetRole) {
  if (actorRole === ROLES.OWNER) {
    return;
  }

  if (actorRole === ROLES.MANAGER && targetRole === ROLES.CASHIER) {
    return;
  }

  throw new ForbiddenError("No autorizado para crear este tipo de usuario");
}

async function createBusinessUser(auth, payload) {
  const name = parseRequiredString(payload?.name);
  const email = parseEmail(payload?.email);
  const password = parseRequiredString(payload?.password);
  const role = parseRequiredString(payload?.role).toUpperCase();

  if (!auth?.businessId) {
    throw new ForbiddenError("No autorizado para crear usuarios");
  }

  if (!name || !email || password.length < 6 || !role) {
    throw new BadRequestError("name, email valido, password de al menos 6 caracteres y role son obligatorios");
  }

  validateTargetRole(role);
  assertCanCreateRole(auth.role, role);

  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ConflictError("El email ya esta registrado");
  }

  const passwordHash = await hashPassword(password);
  const createdUser = await userRepository.createUserInBusiness({
    businessId: auth.businessId,
    name,
    email,
    passwordHash,
    role,
  });

  return sanitizeUser(createdUser);
}

async function listBusinessUsers(auth, query) {
  if (!auth?.businessId) {
    throw new ForbiddenError("No autorizado para listar usuarios");
  }

  const search = parseSearchParams(query);
  const result = await userRepository.searchUsersByBusiness({
    businessId: auth.businessId,
    q: search.q,
    skip: search.skip,
    limit: search.limit,
  });

  return buildSearchResponse({
    items: result.items.map(sanitizeUser),
    page: search.page,
    limit: search.limit,
    total: result.total,
  });
}

async function resetBusinessUserPassword(auth, payload) {
  const userId = parsePositiveInt(payload?.userId);
  const newPassword = parseRequiredString(payload?.newPassword);

  if (!auth?.businessId || auth.role !== ROLES.OWNER) {
    throw new ForbiddenError("No autorizado para resetear contrasenas");
  }

  if (!userId || newPassword.length < 6) {
    throw new BadRequestError("userId valido y newPassword de al menos 6 caracteres son obligatorios");
  }

  const targetUser = await userRepository.findUserById(userId);

  if (!targetUser || targetUser.businessId !== auth.businessId) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const passwordHash = await hashPassword(newPassword);
  const updatedUser = await userRepository.updateUserPassword({
    id: targetUser.id,
    passwordHash,
  });

  return sanitizeUser(updatedUser);
}

module.exports = {
  createBusinessUser,
  listBusinessUsers,
  resetBusinessUserPassword,
};
