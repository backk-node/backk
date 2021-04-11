"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSetCollectionVariableStatements_1 = __importDefault(require("./getSetCollectionVariableStatements"));
const getServiceFunctionReturnValueTests_1 = __importDefault(require("./getServiceFunctionReturnValueTests"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const constants_1 = require("../constants/constants");
const isCreateFunction_1 = __importDefault(require("../service/crudentity/utils/isCreateFunction"));
function getServiceFunctionTests(ServiceClass, serviceTypes, serviceMetadata, functionMetadata, isUpdate, expectedResponseStatusCode = constants_1.HttpStatusCodes.SUCCESS, expectedResponseFieldPathNameToFieldValueMapInTests = undefined, sampleArg = undefined) {
    const serviceEntityName = serviceMetadata.serviceName.split('Service')[0];
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(functionMetadata.returnValueType);
    const checkResponseCode = `pm.test("Status code is ${process.env.NODE_ENV === 'development' &&
        expectedResponseStatusCode >= 300 &&
        expectedResponseStatusCode < 400
        ? constants_1.HttpStatusCodes.SUCCESS
        : expectedResponseStatusCode}", function () {
  pm.response.to.have.status(${process.env.NODE_ENV === 'development' &&
        expectedResponseStatusCode >= 300 &&
        expectedResponseStatusCode < 400 ? constants_1.HttpStatusCodes.SUCCESS : expectedResponseStatusCode});
});`;
    if (isCreateFunction_1.default(ServiceClass, functionMetadata.functionName)) {
        return {
            id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
            listen: 'test',
            script: {
                id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
                exec: [
                    checkResponseCode,
                    'const response = pm.response.json()',
                    ...getSetCollectionVariableStatements_1.default(serviceEntityName, baseTypeName, serviceMetadata, serviceTypes, isArrayType ? '[0].' : '.'),
                    ...getServiceFunctionReturnValueTests_1.default(serviceTypes, baseTypeName, serviceMetadata, isArrayType ? '[0].' : '.', true, isUpdate, sampleArg, expectedResponseFieldPathNameToFieldValueMapInTests).slice(1)
                ]
            }
        };
    }
    const serviceFunctionReturnValueTests = baseTypeName === 'null'
        ? []
        : getServiceFunctionReturnValueTests_1.default(serviceTypes, baseTypeName, serviceMetadata, isArrayType ? '[0].' : '.', true, isUpdate, sampleArg, expectedResponseFieldPathNameToFieldValueMapInTests);
    return {
        id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
        listen: 'test',
        script: {
            id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
            exec: baseTypeName === 'null' || expectedResponseStatusCode !== constants_1.HttpStatusCodes.SUCCESS
                ? [checkResponseCode]
                : [checkResponseCode, ...serviceFunctionReturnValueTests]
        }
    };
}
exports.default = getServiceFunctionTests;
//# sourceMappingURL=getServiceFunctionTests.js.map