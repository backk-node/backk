"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function Update(updateType) {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addUpdateAnnotation(object.constructor, functionName, updateType);
    };
}
exports.default = Update;
//# sourceMappingURL=Update.js.map