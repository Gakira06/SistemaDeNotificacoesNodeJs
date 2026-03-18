const { z } = require("zod");

const createKeySchema = z.object({
  name: z.string().min(1),
  limit: z.coerce.number().int().positive().max(10000),
});

module.exports = {
  createKeySchema,
};
