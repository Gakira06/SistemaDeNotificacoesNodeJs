const env = require("../config/env");
const HttpError = require("../lib/httpError");

function managerGuard(_req, _res, next) {
  if (!env.IS_MANAGER_ON) {
    return next(new HttpError(401, "Nao autorizado: gerenciamento desabilitado"));
  }

  return next();
}

module.exports = managerGuard;
