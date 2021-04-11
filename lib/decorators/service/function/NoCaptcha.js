"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoCaptcha = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function NoCaptcha() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addNoCaptchaAnnotation(object.constructor, functionName);
    };
}
exports.NoCaptcha = NoCaptcha;
//# sourceMappingURL=NoCaptcha.js.map