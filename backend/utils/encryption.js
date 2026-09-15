// AES-256-CBC file encryption using Node's built-in crypto module.
// No external library needed - this is genuine, understandable cryptography,
// not a black box, which is exactly what you want to be able to explain.

const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";

// The 32-character key from .env is used directly as the AES-256 key.
function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be exactly 32 characters long");
  }
  return Buffer.from(key, "utf8");
}

// Encrypts a Buffer (the raw file bytes). Returns the ciphertext plus the
// randomly generated IV needed to decrypt it later. The IV does not need to
// be secret - it just needs to be unique per file, which is why we store it
// alongside the encrypted data in MongoDB rather than hiding it.
function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(16); // AES block size is 16 bytes
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encryptedData: encrypted, iv: iv.toString("hex") };
}

// Reverses encryptBuffer: given the stored ciphertext and its IV, returns
// the original file bytes.
function decryptBuffer(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

module.exports = { encryptBuffer, decryptBuffer };
