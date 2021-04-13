"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function AllowForClusterInternalUse() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addServiceFunctionAllowedForClusterInternalUse(object.constructor, functionName);
    };
}
exports.default = AllowForClusterInternalUse;
//# sourceMappingURL=AllowForClusterInternalUse.js.map