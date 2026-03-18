const twilio = require("twilio");
const env = require("../config/env");
const HttpError = require("../lib/httpError");

const client =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

module.exports = {
  type: "sms",
  async send(message) {
    if (!client || !env.TWILIO_PHONE_NUMBER) {
      throw new HttpError(500, "Integracao Twilio nao configurada");
    }

    await client.messages.create({
      from: env.TWILIO_PHONE_NUMBER,
      to: message.phone,
      body: `${message.title}\n${message.text}`,
    });
  },
};
