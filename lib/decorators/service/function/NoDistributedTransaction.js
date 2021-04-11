"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDistributedTransaction = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function NoDistributedTransaction(reason) {
    if (!reason) {
        throw new Error('reason must be provided for @NoTransaction annotation');
    }
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addNonDistributedTransactionalServiceFunction(object.constructor, functionName);
    };
}
exports.NoDistributedTransaction = NoDistributedTransaction;
//# sourceMappingURL=NoDistributedTransaction.js.map