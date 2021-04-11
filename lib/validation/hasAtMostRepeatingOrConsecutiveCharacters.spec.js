"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hasAtMostRepeatingOrConsecutiveCharacters_1 = __importDefault(require("./hasAtMostRepeatingOrConsecutiveCharacters"));
describe('hasAtMostRepeatingOrConsecutiveCharacters', () => {
    it('should return false when input is "aaab" and atMostCount is 2', () => {
        const input = 'aaab';
        const atMostCount = 2;
        const hasAtMost2ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost2ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "aabbbba" and atMostCount is 3', () => {
        const input = 'aabbbba';
        const atMostCount = 3;
        const hasAtMost3ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost3ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "aabzzz" and atMostCount is 2', () => {
        const input = 'aabzzz';
        const atMostCount = 2;
        const hasAtMost2ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost2ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "abcrnb" and atMostCount is 2', () => {
        const input = 'abcrnb';
        const atMosCount = 2;
        const hasAtMost2ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMosCount);
        expect(hasAtMost2ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "489aopqrs87a" and atMostCount is 4', () => {
        const input = '489aopqrs87a';
        const atMostCount = 4;
        const hasAtMost4ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost4ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "alop1234" and atMostCount is 3', () => {
        const input = 'alop1234';
        const atMostCount = 3;
        const hasAtMost3ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost3ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "qwer6a" and atMostCount is 3', () => {
        const input = 'qwer6a';
        const atMostCount = 3;
        const hasAtMost3ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost3ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "l87asdfg123" and atMostCount is 4', () => {
        const input = 'l87asdfg123';
        const atMostCount = 4;
        const hasAtMost4ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost4ConsecutiveCharacters).toBe(false);
    });
    it('should return false when input is "aa11bbzxc" and atMostCount is 2', () => {
        const input = 'aa11bbzxc';
        const atMostCount = 2;
        const hasAtMost2ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters_1.default(input, atMostCount);
        expect(hasAtMost2ConsecutiveCharacters).toBe(false);
    });
});
//# sourceMappingURL=hasAtMostRepeatingOrConsecutiveCharacters.spec.js.map