"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findServiceFunctionArgumentType(controller, serviceFunctionName) {
    const [serviceName, functionName] = serviceFunctionName.split('.');
    const servicesMetadata = controller.servicesMetadata;
    const foundServiceMetadata = servicesMetadata.find((serviceMetadata) => serviceMetadata.serviceName === serviceName);
    const foundFunctionMetadata = foundServiceMetadata === null || foundServiceMetadata === void 0 ? void 0 : foundServiceMetadata.functions.find(func => func.functionName === functionName);
    if (foundFunctionMetadata) {
        return controller[serviceName].Types[foundFunctionMetadata.argType];
    }
    return undefined;
}
exports.default = findServiceFunctionArgumentType;
//# sourceMappingURL=findServiceFunctionArgumentType.js.map