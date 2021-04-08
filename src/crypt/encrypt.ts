import { createCipheriv, randomBytes } from 'crypto';

export default function encrypt(value: string, shouldUseRandomInitializationVector = true) {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('Encryption key must be provided environment variable ENCRYPTION_KEY');
  } else if (encryptionKey.length < 32) {
    throw new Error('Encryption key must be 32 characters long');
  }

  const initializationVector = shouldUseRandomInitializationVector
    ? randomBytes(16)
    : Buffer.from(encryptionKey.slice(0, 16));

  const cipher = createCipheriv('aes-256-cbc', encryptionKey.slice(0, 32), initializationVector);
  const encryptedValue = cipher.update(Buffer.from(value));
  const finalValue = cipher.final();
  return Buffer.concat([initializationVector, encryptedValue, finalValue]).toString('base64');
}
