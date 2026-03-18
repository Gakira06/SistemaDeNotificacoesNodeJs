const apiKeyService = require("../services/apiKeyService");
const HttpError = require("../lib/httpError");

async function apiKeyAuth(req, _res, next) {
  try {
    const rawApiKey = req.header("api-key");

    if (!rawApiKey) {
      return next(new HttpError(401, "Header api-key nao informado"));
    }

    const apiKey = await apiKeyService.validateApiKey(rawApiKey);

    if (!apiKey) {
      return next(new HttpError(401, "API key invalida"));
    }

    req.apiKey = apiKey;
    req.rawApiKey = rawApiKey;

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = apiKeyAuth;
