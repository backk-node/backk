"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../../../decorators/service/function/serviceFunctionAnnotationContainer"));
function isCreateFunction(ServiceClass, functionName) {
    return (functionName.startsWith('create') ||
        functionName.startsWith('insert') ||
        serviceFunctionAnnotationContainer_1.default.isCreateServiceFunction(ServiceClass, functionName));
}
exports.default = isCreateFunction;
//# sourceMappingURL=isCreateFunction.js.map