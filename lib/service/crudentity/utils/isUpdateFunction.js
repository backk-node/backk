"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../../../decorators/service/function/serviceFunctionAnnotationContainer"));
function isUpdateFunction(ServiceClass, functionName) {
    return (functionName.startsWith('update') ||
        functionName.startsWith('modify') ||
        functionName.startsWith('change') ||
        functionName.startsWith('patch') ||
        !!serviceFunctionAnnotationContainer_1.default.getUpdateTypeForServiceFunction(ServiceClass, functionName));
}
exports.default = isUpdateFunction;
//# sourceMappingURL=isUpdateFunction.js.map