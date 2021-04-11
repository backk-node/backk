"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../../../decorators/service/function/serviceFunctionAnnotationContainer"));
function isDeleteFunction(ServiceClass, functionName) {
    return (functionName.startsWith('delete') ||
        functionName.startsWith('erase') ||
        functionName.startsWith('destroy') ||
        serviceFunctionAnnotationContainer_1.default.isDeleteServiceFunction(ServiceClass, functionName));
}
exports.default = isDeleteFunction;
//# sourceMappingURL=isDeleteFunction.js.map