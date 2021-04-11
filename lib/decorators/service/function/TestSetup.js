"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSetup = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function TestSetup(serviceFunctionsOrSpecsToExecute) {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addTestSetup(object.constructor, functionName, serviceFunctionsOrSpecsToExecute);
    };
}
exports.TestSetup = TestSetup;
//# sourceMappingURL=TestSetup.js.map