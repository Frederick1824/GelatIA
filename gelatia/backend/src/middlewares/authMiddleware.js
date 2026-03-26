const prisma = require("../config/prisma");
const { UnauthorizedError } = require("../lib/errors");
const { verifyAccessToken } = require("../lib/auth");
const userRepository = require("../repositories/user.repository");

async function authenticateRequest(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token de autenticacion requerido");
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();

    if (!token) {
      throw new UnauthorizedError("Token de autenticacion requerido");
    }

    const payload = verifyAccessToken(token);
    const userId = Number(payload.sub);

    const user = await userRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedError("Usuario autenticado no encontrado");
    }

    req.auth = {
      userId: user.id,
      businessId: user.businessId,
      role: user.role,
      email: user.email,
    };

    req.user = user;

    return next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new UnauthorizedError("Token invalido o expirado"));
  }
}

module.exports = {
  authenticateRequest,
};
