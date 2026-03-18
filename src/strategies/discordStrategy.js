const axios = require("axios");
const HttpError = require("../lib/httpError");

module.exports = {
  type: "discord",
  async send(message) {
    if (!message.discordWebhook) {
      throw new HttpError(400, "Webhook do Discord nao informado");
    }

    await axios.post(message.discordWebhook, {
      content: `**${message.title}**\n${message.text}`,
    });
  },
};
