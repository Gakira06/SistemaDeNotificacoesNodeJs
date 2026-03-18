const { v4: uuidv4 } = require("uuid");
const prisma = require("../lib/prisma");
const { createKeyHash, encrypt } = require("../lib/crypto");
const HttpError = require("../lib/httpError");

async function createApiKey({ name, limit }) {
  const plainKey = uuidv4();

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      limit,
      key: encrypt(plainKey),
      keyHash: createKeyHash(plainKey),
    },
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    limit: apiKey.limit,
    key: plainKey,
  };
}

async function deleteApiKey(id) {
  const existing = await prisma.apiKey.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    throw new HttpError(404, "API key nao encontrada");
  }

  await prisma.apiKey.delete({
    where: { id: Number(id) },
  });
}

async function validateApiKey(rawApiKey) {
  return prisma.apiKey.findUnique({
    where: {
      keyHash: createKeyHash(rawApiKey),
    },
  });
}

module.exports = {
  createApiKey,
  deleteApiKey,
  validateApiKey,
};
