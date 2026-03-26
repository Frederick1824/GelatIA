const { AppError } = require("../lib/errors");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error && error.code === "P2002") {
    return res.status(409).json({ error: "Conflicto de unicidad" });
  }

  return res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = errorHandler;
