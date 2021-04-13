"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function NoCaptcha(reason) {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addNoCaptchaAnnotation(object.constructor, functionName);
    };
}
exports.default = NoCaptcha;
//# sourceMappingURL=NoCaptcha.js.map