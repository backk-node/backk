"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowForServiceInternalUse = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function AllowForServiceInternalUse() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addServiceFunctionAllowedForServiceInternalUse(object.constructor, functionName);
    };
}
exports.AllowForServiceInternalUse = AllowForServiceInternalUse;
//# sourceMappingURL=AllowForServiceInternalUse.js.map