"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseEnumValuesFromSrcFile_1 = __importDefault(require("../../typescript/parser/parseEnumValuesFromSrcFile"));
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
function isEnumTypeName(typeName) {
    return (typeName[0] === '(' ||
        (typeName[0] === typeName[0].toUpperCase() &&
            typeName !== 'Date' &&
            !entityAnnotationContainer_1.default.entityNameToClassMap[typeName] &&
            parseEnumValuesFromSrcFile_1.default(typeName).length > 0));
}
exports.default = isEnumTypeName;
//# sourceMappingURL=isEnumTypeName.js.map