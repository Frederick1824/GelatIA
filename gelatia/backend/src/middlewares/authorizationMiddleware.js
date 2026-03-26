const { ForbiddenError } = require("../lib/errors");

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth?.role) {
      return next(new ForbiddenError("No autorizado para realizar esta accion"));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(new ForbiddenError("No autorizado para realizar esta accion"));
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};
