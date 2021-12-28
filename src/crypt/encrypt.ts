import { createCipheriv, randomBytes } from 'crypto';
import RE2 from 're2';
import hasAtMostRepeatingOrConsecutiveCharacters from '../validation/hasAtMostRepeatingOrConsecutiveCharacters';

export default function encrypt(value: string, shouldUseRandomInitializationVector = true) {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('Encryption key must be provided environment variable ENCRYPTION_KEY');
  } else if (encryptionKey.length < 32) {
    throw new Error(
      'Encryption key must be 32 characters long as given in environment variable ENCRYPTION_KEY'
    );
  }

  if (process.env.NODE_ENV === 'production') {
    for (const regExp of [/[a-z]+/, /[A-Z]+/, /\d+/]) {
      const re2RegExp = new RE2(regExp);
      const doesMatch = re2RegExp.test(encryptionKey);
      if (!doesMatch) {
        throw new Error(
          'Encryption key, as given in environment variable ENCRYPTION_KEY, must contain at least one lowercase character, one uppercase character and one number.'
        );
      }
    }

    if (!hasAtMostRepeatingOrConsecutiveCharacters(encryptionKey, 3)) {
      throw new Error(
        'Encryption key, as given in environment variable ENCRYPTION_KEY, cannot have more than 3 alphabetically consecutive letters or numerically consecutive digits (e.g. abcd and 1234 are prohibited). Encryption key may not contain more than 3 repeating characters/numbers (e.g. 1111 and aaaa are prohibited). Encryption key may not contain more than 4 keyboard layout consecutive characters, e.g. qwert and asdf are prohibited'
      );
    }
  }

  const initializationVector = shouldUseRandomInitializationVector
    ? randomBytes(16)
    : Buffer.from(encryptionKey.slice(0, 16));

  const cipher = createCipheriv('aes-256-cbc', encryptionKey.slice(0, 32), initializationVector);
  const encryptedValue = cipher.update(Buffer.from(value));
  const finalValue = cipher.final();
  return Buffer.concat([initializationVector, encryptedValue, finalValue]).toString('base64');
}
