"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnStartUp = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function OnStartUp() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addOnStartUpAnnotation(object.constructor, functionName);
    };
}
exports.OnStartUp = OnStartUp;
//# sourceMappingURL=OnStartUp.js.map