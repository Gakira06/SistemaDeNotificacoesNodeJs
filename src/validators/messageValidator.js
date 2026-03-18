const { z } = require("zod");
const { MESSAGE_TYPE, MESSAGE_STATUS } = require("../config/constants");

const createMessageSchema = z
  .object({
    title: z.string().min(1),
    text: z.string().min(1),
    type: z.enum([
      MESSAGE_TYPE.DISCORD,
      MESSAGE_TYPE.EMAIL,
      MESSAGE_TYPE.WHATSAPP,
      MESSAGE_TYPE.SMS,
      MESSAGE_TYPE.PHONE_CALL,
    ]),
    phone: z.string().trim().optional(),
    email: z.string().email().optional(),
    discordWebhook: z.string().url().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      [MESSAGE_TYPE.WHATSAPP, MESSAGE_TYPE.SMS, MESSAGE_TYPE.PHONE_CALL].includes(value.type) &&
      !value.phone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Campo phone e obrigatorio para este tipo de mensagem",
        path: ["phone"],
      });
    }

    if (value.type === MESSAGE_TYPE.EMAIL && !value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Campo email e obrigatorio para mensagens de email",
        path: ["email"],
      });
    }

    if (value.type === MESSAGE_TYPE.DISCORD && !value.discordWebhook) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Campo discordWebhook e obrigatorio para mensagens de Discord",
        path: ["discordWebhook"],
      });
    }
  });

const listMessageSchema = z.object({
  id: z.string().uuid().optional(),
  status: z
    .enum([MESSAGE_STATUS.PENDING, MESSAGE_STATUS.SENT, MESSAGE_STATUS.FAILURE])
    .optional(),
  type: z
    .enum([
      MESSAGE_TYPE.DISCORD,
      MESSAGE_TYPE.EMAIL,
      MESSAGE_TYPE.WHATSAPP,
      MESSAGE_TYPE.SMS,
      MESSAGE_TYPE.PHONE_CALL,
    ])
    .optional(),
  sendDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "sendDate deve estar em formato ISO")
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

module.exports = {
  createMessageSchema,
  listMessageSchema,
};
