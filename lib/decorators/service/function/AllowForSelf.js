"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function AllowForSelf() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addServiceFunctionAllowedForSelf(object.constructor, functionName);
    };
}
exports.default = AllowForSelf;
//# sourceMappingURL=AllowForSelf.js.map