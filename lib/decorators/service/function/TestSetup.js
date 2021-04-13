"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function TestSetup(serviceFunctionsOrSpecsToExecute) {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addTestSetup(object.constructor, functionName, serviceFunctionsOrSpecsToExecute);
    };
}
exports.default = TestSetup;
//# sourceMappingURL=TestSetup.js.map