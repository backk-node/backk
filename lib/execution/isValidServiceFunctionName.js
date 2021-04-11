"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isValidServiceFunctionName(serviceFunctionName, controller) {
    const [serviceName, functionName] = serviceFunctionName.split('.');
    if (!controller[serviceName]) {
        return false;
    }
    const serviceFunctionResponseValueTypeName = controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];
    if (!controller[serviceName][functionName] || !serviceFunctionResponseValueTypeName) {
        return false;
    }
    return true;
}
exports.default = isValidServiceFunctionName;
//# sourceMappingURL=isValidServiceFunctionName.js.map