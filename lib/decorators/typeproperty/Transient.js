"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function Transient() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsTransient(object.constructor, propertyName);
    };
}
exports.default = Transient;
//# sourceMappingURL=Transient.js.map