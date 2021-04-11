"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowForClusterInternalUse = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function AllowForClusterInternalUse() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addServiceFunctionAllowedForClusterInternalUse(object.constructor, functionName);
    };
}
exports.AllowForClusterInternalUse = AllowForClusterInternalUse;
//# sourceMappingURL=AllowForClusterInternalUse.js.map