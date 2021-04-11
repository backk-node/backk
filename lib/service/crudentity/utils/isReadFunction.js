"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isReadFunction(serviceClass, functionName) {
    return functionName.startsWith('get') ||
        functionName.startsWith('find') ||
        functionName.startsWith('read') ||
        functionName.startsWith('fetch') ||
        functionName.startsWith('retrieve') ||
        functionName.startsWith('obtain');
}
exports.default = isReadFunction;
//# sourceMappingURL=isReadFunction.js.map