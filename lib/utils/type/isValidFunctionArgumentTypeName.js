"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getSrcFilePathNameForTypeName_1 = require("../file/getSrcFilePathNameForTypeName");
function isValidFunctionArgumentTypeName(typeName, remoteServiceRootDir) {
    if (typeName === '_Id' ||
        typeName === 'Id' ||
        typeName === 'DefaultPostQueryOperations' ||
        typeName === 'IdsAndDefaultPostQueryOperations' ||
        typeName === 'SortBy' ||
        typeName === 'SubPagination' ||
        typeName === '_IdAndUserId') {
        return true;
    }
    return getSrcFilePathNameForTypeName_1.hasSrcFilenameForTypeName(typeName, remoteServiceRootDir);
}
exports.default = isValidFunctionArgumentTypeName;
//# sourceMappingURL=isValidFunctionArgumentTypeName.js.map