"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isExecuteMultipleRequest(serviceFunctionName) {
    if (serviceFunctionName === 'executeMultipleInParallelInsideTransaction' ||
        serviceFunctionName === 'executeMultipleInParallelWithoutTransaction' ||
        serviceFunctionName === 'executeMultipleInSequenceInsideTransaction' ||
        serviceFunctionName === 'executeMultipleInSequenceWithoutTransaction') {
        return true;
    }
    return false;
}
exports.default = isExecuteMultipleRequest;
//# sourceMappingURL=isExecuteMultipleRequest.js.map