import { createDecipheriv } from 'crypto';

export default function decrypt(encryptedValue: string) {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('Encryption key must be provided environment variable ENCRYPTION_KEY');
  } else if (encryptionKey.length < 32) {
    throw new Error('Encryption key must be 32 characters long');
  }

  const encryptedValueBuffer = Buffer.from(encryptedValue, 'base64');
  const initializationVector = encryptedValueBuffer.slice(0, 16);
  const decipher = createDecipheriv('aes-256-cbc', encryptionKey.slice(0, 32), initializationVector);
  return decipher.update(encryptedValueBuffer.slice(16)).toString('utf-8') + decipher.final('utf-8');
}
