const { createMessageSchema, listMessageSchema } = require("../validators/messageValidator");
const messageService = require("../services/messageService");
const HttpError = require("../lib/httpError");

async function createMessage(req, res) {
  const parsed = createMessageSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new HttpError(400, "Payload invalido", parsed.error.flatten());
  }

  const message = await messageService.createMessage(parsed.data, req.apiKey);

  return res.status(202).json({
    id: message.id,
    status: message.status,
    message: "Mensagem recebida e adicionada a fila",
  });
}

async function listMessages(req, res) {
  const parsed = listMessageSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new HttpError(400, "Filtros invalidos", parsed.error.flatten());
  }

  const messages = await messageService.listMessages(parsed.data, req.apiKey);

  return res.json(messages);
}

async function deleteMessage(req, res) {
  await messageService.cancelPendingMessage(req.params.id, req.apiKey);

  return res.status(204).send();
}

module.exports = {
  createMessage,
  listMessages,
  deleteMessage,
};
