const MESSAGE_PROCESSOR_INTERVAL_MS = 120000;

const MESSAGE_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  FAILURE: "failure",
};

const MESSAGE_TYPE = {
  DISCORD: "discord",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  SMS: "sms",
  PHONE_CALL: "phoneCall",
};

module.exports = {
  MESSAGE_PROCESSOR_INTERVAL_MS,
  MESSAGE_STATUS,
  MESSAGE_TYPE,
};
