const { createKeySchema } = require("../validators/keyValidator");
const apiKeyService = require("../services/apiKeyService");
const HttpError = require("../lib/httpError");

async function createKey(req, res) {
  const parsed = createKeySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new HttpError(400, "Payload invalido", parsed.error.flatten());
  }

  const key = await apiKeyService.createApiKey(parsed.data);
  return res.status(201).json(key);
}

async function deleteKey(req, res) {
  await apiKeyService.deleteApiKey(req.params.id);
  return res.status(204).send();
}

module.exports = {
  createKey,
  deleteKey,
};
