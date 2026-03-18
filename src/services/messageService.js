const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const logger = require("../lib/logger");

async function assertRateLimit(apiKeyId, limit) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const messagesInWindow = await prisma.message.count({
    where: {
      apiKeyId,
      createdAt: {
        gte: oneMinuteAgo,
      },
    },
  });

  if (messagesInWindow >= limit) {
    throw new HttpError(429, "Limite de mensagens por minuto excedido");
  }
}

async function createMessage(data, apiKey) {
  await assertRateLimit(apiKey.id, apiKey.limit);

  const message = await prisma.message.create({
    data: {
      ...data,
      apiKeyId: apiKey.id,
    },
  });

  logger.info(
    {
      messageId: message.id,
      apiKeyId: apiKey.id,
      type: message.type,
    },
    "message queued",
  );

  return message;
}

async function listMessages(filters, apiKey) {
  const sendDateFilter = filters.sendDate
    ? filters.sendDate.length <= 10
      ? {
          gte: new Date(`${filters.sendDate}T00:00:00.000Z`),
          lt: new Date(`${filters.sendDate}T23:59:59.999Z`),
        }
      : {
          gte: new Date(filters.sendDate),
          lte: new Date(filters.sendDate),
        }
    : undefined;

  return prisma.message.findMany({
    where: {
      apiKeyId: apiKey.id,
      id: filters.id,
      status: filters.status,
      type: filters.type,
      sendDate: sendDateFilter,
    },
    include: {
      apiKey: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: filters.limit,
  });
}

async function cancelPendingMessage(id, apiKey) {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw new HttpError(404, "Mensagem nao encontrada");
  }

  if (message.apiKeyId !== apiKey.id) {
    throw new HttpError(403, "Acesso negado para esta mensagem");
  }

  if (message.status !== "pending") {
    throw new HttpError(400, "Apenas mensagens pendentes podem ser canceladas");
  }

  await prisma.message.delete({
    where: { id },
  });

  logger.info({ messageId: id }, "message cancelled");
}

module.exports = {
  createMessage,
  listMessages,
  cancelPendingMessage,
};
