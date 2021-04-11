"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hasAtMostRepeatingOrConsecutiveCharacters(str, atMostCount) {
    if (atMostCount > 26) {
        throw new Error('atMostCount must be less than 26');
    }
    if (str.length > 26) {
        return true;
    }
    str = str.toLowerCase();
    let maxConsecutiveIdenticalCharacterCount = 0;
    for (let i = 0; i < str.length; i++) {
        const character = str[i];
        let consecutiveIdenticalCharacterCount = 1;
        for (let j = i + 1; j < str.length; j++) {
            if (str[j] === character) {
                consecutiveIdenticalCharacterCount++;
            }
            else {
                break;
            }
            if (consecutiveIdenticalCharacterCount > maxConsecutiveIdenticalCharacterCount) {
                maxConsecutiveIdenticalCharacterCount = consecutiveIdenticalCharacterCount;
            }
            if (consecutiveIdenticalCharacterCount > atMostCount) {
                return false;
            }
        }
    }
    let maxAlphabeticallyConsecutiveCharacterCount = 0;
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        let alphabeticallyConsecutiveCharacterCount = 1;
        for (let j = i + 1; j < str.length; j++) {
            if (str.charCodeAt(j) === charCode + 1) {
                alphabeticallyConsecutiveCharacterCount++;
                charCode++;
            }
            else {
                break;
            }
            if (alphabeticallyConsecutiveCharacterCount > maxAlphabeticallyConsecutiveCharacterCount) {
                maxAlphabeticallyConsecutiveCharacterCount = alphabeticallyConsecutiveCharacterCount;
            }
            if (alphabeticallyConsecutiveCharacterCount > atMostCount) {
                return false;
            }
        }
    }
    let maxInKeyboardLayoutConsecutiveLetterCount = 0;
    const letters = 'qwertyuiopasdfghjklzxcvbnm';
    for (let i = 0; i < str.length; i++) {
        for (let j = 1; j <= str.length - i; j++) {
            if (letters.indexOf(str.slice(i, i + j)) !== -1) {
                if (j > maxInKeyboardLayoutConsecutiveLetterCount) {
                    maxInKeyboardLayoutConsecutiveLetterCount = j;
                    if (maxInKeyboardLayoutConsecutiveLetterCount > atMostCount) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
exports.default = hasAtMostRepeatingOrConsecutiveCharacters;
//# sourceMappingURL=hasAtMostRepeatingOrConsecutiveCharacters.js.map