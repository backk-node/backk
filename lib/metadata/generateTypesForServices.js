"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("../service/BaseService"));
const generateClassFromSrcFile_1 = __importDefault(require("../typescript/generator/generateClassFromSrcFile"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
function generateTypesForServices(controller, remoteServiceRootDir = '') {
    return Object.entries(controller)
        .filter(([serviceName, service]) => service instanceof BaseService_1.default || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__')))
        .map(([serviceName]) => {
        const functionNames = Object.keys(controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap);
        functionNames.forEach((functionName) => {
            const functionArgumentTypeName = controller[`${serviceName}__BackkTypes__`]
                .functionNameToParamTypeNameMap[functionName];
            if (functionArgumentTypeName !== undefined &&
                !controller[serviceName].Types[functionArgumentTypeName]) {
                const FunctionArgumentClass = generateClassFromSrcFile_1.default(functionArgumentTypeName, remoteServiceRootDir);
                controller[serviceName].Types[functionArgumentTypeName] = FunctionArgumentClass;
                controller[serviceName].PublicTypes[functionArgumentTypeName] = FunctionArgumentClass;
            }
            if (functionArgumentTypeName !== undefined) {
                let proto = Object.getPrototypeOf(new controller[serviceName].Types[functionArgumentTypeName]());
                while (proto !== Object.prototype) {
                    if (functionArgumentTypeName !== proto.constructor.name &&
                        !controller[serviceName].Types[functionArgumentTypeName + ':' + proto.constructor.name]) {
                        controller[serviceName].Types[functionArgumentTypeName + ':' + proto.constructor.name] = proto.constructor;
                    }
                    proto = Object.getPrototypeOf(proto);
                }
            }
            const returnValueTypeName = controller[`${serviceName}__BackkTypes__`]
                .functionNameToReturnTypeNameMap[functionName];
            const { baseTypeName } = getTypeInfoForTypeName_1.default(returnValueTypeName);
            if (baseTypeName !== 'null' && !controller[serviceName].Types[baseTypeName]) {
                const FunctionReturnValueClass = generateClassFromSrcFile_1.default(baseTypeName, remoteServiceRootDir);
                controller[serviceName].Types[baseTypeName] = FunctionReturnValueClass;
                controller[serviceName].PublicTypes[baseTypeName] = FunctionReturnValueClass;
            }
            if (baseTypeName !== 'null') {
                let proto = Object.getPrototypeOf(new controller[serviceName].Types[baseTypeName]());
                while (proto !== Object.prototype) {
                    if (baseTypeName !== proto.constructor.name &&
                        !controller[serviceName].Types[baseTypeName + ':' + proto.constructor.name]) {
                        controller[serviceName].Types[baseTypeName + ':' + proto.constructor.name] =
                            proto.constructor;
                    }
                    proto = Object.getPrototypeOf(proto);
                }
            }
        });
    });
}
exports.default = generateTypesForServices;
//# sourceMappingURL=generateTypesForServices.js.map