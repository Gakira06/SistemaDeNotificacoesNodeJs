const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");
const logger = require("./lib/logger");
const { startMessageProcessor } = require("./services/messageProcessor");

async function bootstrap() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "server started");
  });

  startMessageProcessor();
}

bootstrap().catch(async (error) => {
  logger.error({ err: error }, "failed to start application");
  await prisma.$disconnect();
  process.exit(1);
});
