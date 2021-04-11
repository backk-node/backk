"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
function encrypt(value, shouldUseRandomInitializationVector = true) {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
        throw new Error('Encryption key must be provided environment variable ENCRYPTION_KEY');
    }
    else if (encryptionKey.length < 32) {
        throw new Error('Encryption key must be 32 characters long');
    }
    const initializationVector = shouldUseRandomInitializationVector
        ? crypto_1.randomBytes(16)
        : Buffer.from(encryptionKey.slice(0, 16));
    const cipher = crypto_1.createCipheriv('aes-256-cbc', encryptionKey.slice(0, 32), initializationVector);
    const encryptedValue = cipher.update(Buffer.from(value));
    const finalValue = cipher.final();
    return Buffer.concat([initializationVector, encryptedValue, finalValue]).toString('base64');
}
exports.default = encrypt;
//# sourceMappingURL=encrypt.js.map