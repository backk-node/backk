"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowForEveryUser = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function AllowForEveryUser() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addServiceFunctionAllowedForEveryUser(object.constructor, functionName);
    };
}
exports.AllowForEveryUser = AllowForEveryUser;
//# sourceMappingURL=AllowForEveryUser.js.map