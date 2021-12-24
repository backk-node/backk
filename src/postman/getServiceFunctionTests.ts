import getSetCollectionVariableStatements from './getSetCollectionVariableStatements';
import getServiceFunctionReturnValueTests from './getServiceFunctionReturnValueTests';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import { HttpStatusCodes } from '../constants/constants';
import isCreateFunction from '../services/crudentity/utils/isCreateFunction';

export default function getServiceFunctionTests(
  ServiceClass: Function,
  serviceTypes: { [key: string]: Function },
  serviceMetadata: ServiceMetadata,
  functionMetadata: FunctionMetadata,
  isUpdate: boolean,
  expectedResponseStatusCode = HttpStatusCodes.OK,
  expectedResponseFieldPathNameToFieldValueMapInTests: { [key: string]: any } | undefined = undefined,
  sampleArg: object | undefined = undefined
): object | undefined {
  const serviceEntityName = serviceMetadata.serviceName.split('Service')[0];
  const { baseTypeName, isArrayType } = getTypeInfoForTypeName(functionMetadata.returnValueType);

  const checkResponseCode = `pm.test("Status code is ${
    process.env.NODE_ENV === 'development' &&
    expectedResponseStatusCode >= 300 &&
    expectedResponseStatusCode < 400
      ? HttpStatusCodes.OK
      : expectedResponseStatusCode
  }", function () {
  pm.response.to.have.status(${
    process.env.NODE_ENV === 'development' &&
    expectedResponseStatusCode >= 300 &&
    expectedResponseStatusCode < 400 ? HttpStatusCodes.OK : expectedResponseStatusCode
  });
});`;

  if (isCreateFunction(ServiceClass, functionMetadata.functionName)) {
    return {
      id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
      listen: 'test',
      script: {
        id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
        exec: [
          checkResponseCode,
          'let response = pm.response.json(); response = response.data || response;',
          ...getSetCollectionVariableStatements(
            serviceEntityName,
            baseTypeName,
            serviceMetadata,
            serviceTypes,
            isArrayType ? '[0].' : '.'
          ),
          ...getServiceFunctionReturnValueTests(
            serviceTypes,
            baseTypeName,
            serviceMetadata,
            isArrayType ? '[0].' : '.',
            true,
            isUpdate,
            sampleArg,
            expectedResponseFieldPathNameToFieldValueMapInTests
          ).slice(1)
        ]
      }
    };
  }

  const serviceFunctionReturnValueTests =
    baseTypeName === 'null'
      ? []
      : getServiceFunctionReturnValueTests(
          serviceTypes,
          baseTypeName,
          serviceMetadata,
          isArrayType ? '[0].' : '.',
          true,
          isUpdate,
          sampleArg,
          expectedResponseFieldPathNameToFieldValueMapInTests
        );

  return {
    id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
    listen: 'test',
    script: {
      id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
      exec:
        baseTypeName === 'null' || expectedResponseStatusCode !== HttpStatusCodes.OK
          ? [checkResponseCode]
          : [checkResponseCode, ...serviceFunctionReturnValueTests]
    }
  };
}
