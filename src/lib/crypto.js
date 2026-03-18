const crypto = require("crypto");
const env = require("../config/env");

function createKeyHash(value) {
  return crypto
    .createHmac("sha256", env.APP_SECRET)
    .update(value)
    .digest("hex");
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    crypto.createHash("sha256").update(env.APP_SECRET).digest(),
    iv,
  );

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

module.exports = {
  createKeyHash,
  encrypt,
};
