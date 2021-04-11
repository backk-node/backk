"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getSrcFilePathNameForTypeName_1 = require("./getSrcFilePathNameForTypeName");
function getTypeFilePathNameFor(typeName) {
    const filePathNames = getSrcFilePathNameForTypeName_1.getFileNamesRecursively(process.cwd() + '/src');
    return filePathNames.find((filePathName) => filePathName.endsWith('/' + typeName + '.type'));
}
exports.default = getTypeFilePathNameFor;
//# sourceMappingURL=getTypeFilePathNameFor.js.map