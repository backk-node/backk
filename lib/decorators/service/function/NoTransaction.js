"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoTransaction = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function NoTransaction(reason) {
    return function (object, functionName) {
        if (!reason) {
            throw new Error('reason must be provided for @NoTransaction annotation');
        }
        serviceFunctionAnnotationContainer_1.default.addNonTransactionalServiceFunction(object.constructor, functionName);
    };
}
exports.NoTransaction = NoTransaction;
//# sourceMappingURL=NoTransaction.js.map