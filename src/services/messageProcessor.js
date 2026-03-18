const prisma = require("../lib/prisma");
const logger = require("../lib/logger");
const env = require("../config/env");
const { getStrategy } = require("../strategies");
const { MESSAGE_STATUS } = require("../config/constants");

let timer = null;
let isRunning = false;

async function processSingleMessage(message) {
  const strategy = getStrategy(message.type);

  if (!strategy) {
    throw new Error(`Strategy nao encontrada para o tipo ${message.type}`);
  }

  await strategy.send(message);

  await prisma.$transaction([
    prisma.message.update({
      where: { id: message.id },
      data: {
        status: MESSAGE_STATUS.SENT,
        sendDate: new Date(),
        lastError: null,
      },
    }),
    prisma.apiKey.update({
      where: { id: message.apiKeyId },
      data: {
        lastSend: new Date(),
        totalMensagens: {
          increment: 1,
        },
      },
    }),
  ]);

  logger.info({ messageId: message.id, type: message.type }, "message sent");
}

async function markFailure(message, error) {
  await prisma.message.update({
    where: { id: message.id },
    data: {
      status: MESSAGE_STATUS.FAILURE,
      attemptCount: {
        increment: 1,
      },
      lastError: error.message,
    },
  });

  logger.error(
    {
      messageId: message.id,
      type: message.type,
      err: error,
    },
    "message delivery failed",
  );
}

async function runCycle() {
  if (isRunning) {
    logger.warn("message processor cycle skipped because previous cycle is still running");
    return;
  }

  isRunning = true;

  try {
    const messages = await prisma.message.findMany({
      where: {
        status: {
          in: [MESSAGE_STATUS.PENDING, MESSAGE_STATUS.FAILURE],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100,
    });

    for (const message of messages) {
      try {
        await processSingleMessage(message);
      } catch (error) {
        await markFailure(message, error);
      }
    }
  } finally {
    isRunning = false;
  }
}

function startMessageProcessor() {
  if (timer) {
    return;
  }

  timer = setInterval(runCycle, env.JOB_INTERVAL_MS);
  timer.unref();
  runCycle().catch((error) => {
    logger.error({ err: error }, "initial message processor cycle failed");
  });
}

module.exports = {
  startMessageProcessor,
  runCycle,
};
