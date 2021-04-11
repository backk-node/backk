"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
function shouldHashValue(propertyName, EntityClass) {
    return ((propertyName.toLowerCase().includes('password') ||
        typePropertyAnnotationContainer_1.default.isTypePropertyHashed(EntityClass, propertyName)) &&
        !typePropertyAnnotationContainer_1.default.isTypePropertyNotHashed(EntityClass, propertyName));
}
exports.default = shouldHashValue;
//# sourceMappingURL=shouldHashValue.js.map