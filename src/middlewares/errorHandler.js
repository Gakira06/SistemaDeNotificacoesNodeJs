const logger = require("../lib/logger");

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  logger.error(
    {
      err: error,
      details: error.details,
    },
    "request failed",
  );

  return res.status(statusCode).json({
    error: error.message || "Erro interno do servidor",
    details: error.details || undefined,
  });
}

module.exports = errorHandler;
