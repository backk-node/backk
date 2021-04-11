"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
function isEntityTypeName(typeName) {
    return entityAnnotationContainer_1.default.entityNameToClassMap[typeName] &&
        typeName[0] === typeName[0].toUpperCase() &&
        typeName[0] !== '(';
}
exports.default = isEntityTypeName;
//# sourceMappingURL=isEntityTypeName.js.map