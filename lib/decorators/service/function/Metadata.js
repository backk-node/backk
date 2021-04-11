"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function Metadata() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addMetadataFunctionAnnotation(object.constructor, functionName);
        serviceFunctionAnnotationContainer_1.default.addNoAutoTestAnnotation(object.constructor, functionName);
    };
}
exports.Metadata = Metadata;
//# sourceMappingURL=Metadata.js.map