"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function tryGetSeparatedIntegerValuesFromTextFile(filePathName, separator = '\n') {
    return fs_1.readFileSync(filePathName, { encoding: 'UTF-8' })
        .split(separator)
        .filter((value) => value)
        .map((value) => value.trim())
        .map((value) => parseInt(value, 10));
}
exports.default = tryGetSeparatedIntegerValuesFromTextFile;
//# sourceMappingURL=tryGetSeparateNumericValuesFromTextFile.js.map