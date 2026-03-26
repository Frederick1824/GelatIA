const { hashPassword, comparePassword, signAccessToken } = require("../lib/auth");
const { BadRequestError, ConflictError, UnauthorizedError } = require("../lib/errors");
const { parseEmail, parseRequiredString } = require("../lib/validation");
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

async function registerOwner(payload) {
  const businessName = parseRequiredString(payload?.businessName);
  const name = parseRequiredString(payload?.name);
  const email = parseEmail(payload?.email);
  const password = parseRequiredString(payload?.password);

  if (!businessName || !name || !email || password.length < 6) {
    throw new BadRequestError("businessName, name, email valido y password de al menos 6 caracteres son obligatorios");
  }

  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ConflictError("El email ya esta registrado");
  }

  const passwordHash = await hashPassword(password);

  const result = await userRepository.createOwnerWithBusiness({
    businessName,
    name,
    email,
    passwordHash,
  });

  return {
    token: signAccessToken(result.user),
    business: result.business,
    user: sanitizeUser(result.user),
  };
}

async function login(payload) {
  const email = parseEmail(payload?.email);
  const password = parseRequiredString(payload?.password);

  if (!email || !password) {
    throw new BadRequestError("email y password son obligatorios");
  }

  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError("Credenciales invalidas");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new UnauthorizedError("Credenciales invalidas");
  }

  return {
    token: signAccessToken(user),
    user: sanitizeUser(user),
  };
}

module.exports = {
  login,
  registerOwner,
};
