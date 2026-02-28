import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const keyHex = process.env.TOKEN_ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error("TOKEN_ENCRYPTION_KEY is not configured");
  }

  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a 32-byte hex string");
  }

  return Buffer.from(keyHex, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext || typeof ciphertext !== "string") {
    return ciphertext;
  }

  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    // Return original string as it's not in the expected format (likely unencrypted)
    return ciphertext;
  }

  const [ivBase64, authTagBase64, encryptedBase64] = parts;

  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    // If any part is empty, it's not our format
    return ciphertext;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");
    const encrypted = Buffer.from(encryptedBase64, "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    // If decryption fails (e.g. wrong key, bad data), return the original string as a fallback
    return ciphertext;
  }
}
