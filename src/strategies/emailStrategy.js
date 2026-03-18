const { Resend } = require("resend");
const env = require("../config/env");
const HttpError = require("../lib/httpError");

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

module.exports = {
  type: "email",
  async send(message) {
    if (!resend || !env.RESEND_FROM_EMAIL) {
      throw new HttpError(500, "Integracao de email nao configurada");
    }

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: [message.email],
      subject: message.title,
      text: message.text,
    });
  },
};
