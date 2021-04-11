"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoAutoTest = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function NoAutoTest() {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addNoAutoTestAnnotation(object.constructor, functionName);
    };
}
exports.NoAutoTest = NoAutoTest;
//# sourceMappingURL=NoAutoTest.js.map