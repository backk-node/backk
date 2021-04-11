"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decrypt_1 = __importDefault(require("./decrypt"));
const encrypt_1 = __importDefault(require("./encrypt"));
describe('decrypt', () => {
    it('should decrypt encrypted value with random initialization vector', () => {
        const encryptedValue = encrypt_1.default('4');
        const decryptedValue = decrypt_1.default(encryptedValue);
        expect(decryptedValue).toEqual('4');
    });
    it('should decrypt encrypted value with fixed initialization vector', () => {
        const encryptedValue = encrypt_1.default('4234 1111 1111 1111', false);
        const encryptedValue2 = encrypt_1.default('4234 1111 1111 1111', false);
        const decryptedValue = decrypt_1.default(encryptedValue);
        expect(decryptedValue).toEqual('4234 1111 1111 1111');
        expect(encryptedValue).toEqual(encryptedValue2);
    });
});
//# sourceMappingURL=decrypt.spec.js.map