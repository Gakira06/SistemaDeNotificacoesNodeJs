const twilio = require("twilio");
const env = require("../config/env");
const HttpError = require("../lib/httpError");

const client =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

module.exports = {
  type: "phoneCall",
  async send(message) {
    if (!client || !env.TWILIO_PHONE_NUMBER) {
      throw new HttpError(500, "Integracao Twilio nao configurada");
    }

    const twiml = `<Response><Say>${message.title}. ${message.text}</Say></Response>`;

    await client.calls.create({
      from: env.TWILIO_PHONE_NUMBER,
      to: message.phone,
      twiml,
    });
  },
};
