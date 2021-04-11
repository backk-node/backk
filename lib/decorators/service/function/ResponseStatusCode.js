"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatusCode = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function ResponseStatusCode(statusCode) {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addResponseStatusCodeForServiceFunction(object.constructor, functionName, statusCode);
    };
}
exports.ResponseStatusCode = ResponseStatusCode;
//# sourceMappingURL=ResponseStatusCode.js.map