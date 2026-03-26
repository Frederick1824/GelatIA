const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const TOKEN_EXPIRATION = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no esta configurado");
  }

  return secret;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      businessId: user.businessId,
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRATION }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  comparePassword,
  hashPassword,
  signAccessToken,
  verifyAccessToken,
};
