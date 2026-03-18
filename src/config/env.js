const dotenv = require("dotenv");
const { z } = require("zod");
const { MESSAGE_PROCESSOR_INTERVAL_MS } = require("./constants");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  APP_SECRET: z.string().min(32),
  IS_MANAGER_ON: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  JOB_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(MESSAGE_PROCESSOR_INTERVAL_MS),
  TWILIO_ACCOUNT_SID: z.string().optional().default(""),
  TWILIO_AUTH_TOKEN: z.string().optional().default(""),
  TWILIO_PHONE_NUMBER: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM_EMAIL: z.string().email().optional().or(z.literal("")).default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Variaveis de ambiente invalidas: ${parsed.error.errors
      .map((error) => `${error.path.join(".")}: ${error.message}`)
      .join(", ")}`,
  );
}

module.exports = parsed.data;
