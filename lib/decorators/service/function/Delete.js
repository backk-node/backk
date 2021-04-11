"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function Delete() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addDeleteAnnotation(object.constructor, functionName);
    };
}
exports.Delete = Delete;
//# sourceMappingURL=Delete.js.map