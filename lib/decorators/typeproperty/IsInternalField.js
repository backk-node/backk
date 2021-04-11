"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsInternalField = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function IsInternalField() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsInternal(object.constructor, propertyName);
    };
}
exports.IsInternalField = IsInternalField;
//# sourceMappingURL=IsInternalField.js.map