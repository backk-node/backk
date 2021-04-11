"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encrypted = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function Encrypted() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsEncrypted(object.constructor, propertyName);
    };
}
exports.Encrypted = Encrypted;
//# sourceMappingURL=Encypted.js.map