import BaseService from '../service/BaseService';
import generateClassFromSrcFile from '../typescript/generator/generateClassFromSrcFile';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';

export default function generateTypesForServices<T>(microservice: T, remoteServiceRootDir = '') {
  return Object.entries(microservice)
    .filter(
      ([serviceName, service]: [string, any]) =>
        service instanceof BaseService || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__'))
    )
    .map(([serviceName]: [string, any]) => {
      (microservice as any)[serviceName].TopLevelTypes = {};

      const functionNames = Object.keys(
        (microservice as any)[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap
      );

      functionNames.forEach((functionName) => {
        const functionArgumentTypeName = (microservice as any)[`${serviceName}__BackkTypes__`]
          .functionNameToParamTypeNameMap[functionName];

        if (
          functionArgumentTypeName !== undefined &&
          !(microservice as any)[serviceName].Types[functionArgumentTypeName]
        ) {
          const FunctionArgumentClass = generateClassFromSrcFile(
            functionArgumentTypeName,
            remoteServiceRootDir
          );

          (microservice as any)[serviceName].Types[functionArgumentTypeName] = FunctionArgumentClass;
          (microservice as any)[serviceName].TopLevelTypes[functionArgumentTypeName] = FunctionArgumentClass;
        }

        if (functionArgumentTypeName !== undefined) {
          let proto = Object.getPrototypeOf(
            new ((microservice as any)[serviceName].Types[functionArgumentTypeName] as new () => any)()
          );
          while (proto !== Object.prototype) {
            if (
              functionArgumentTypeName !== proto.constructor.name &&
              !(microservice as any)[serviceName].Types[functionArgumentTypeName + ':' + proto.constructor.name]
            ) {
              (microservice as any)[serviceName].Types[
                functionArgumentTypeName + ':' + proto.constructor.name
              ] = proto.constructor;
            }
            proto = Object.getPrototypeOf(proto);
          }
        }

        const returnValueTypeName: string = (microservice as any)[`${serviceName}__BackkTypes__`]
          .functionNameToReturnTypeNameMap[functionName];

        const { baseTypeName } = getTypeInfoForTypeName(returnValueTypeName);

        if (baseTypeName !== 'null' && !(microservice as any)[serviceName].Types[baseTypeName]) {
          const FunctionReturnValueClass = generateClassFromSrcFile(baseTypeName, remoteServiceRootDir);
          (microservice as any)[serviceName].Types[baseTypeName] = FunctionReturnValueClass;
          (microservice as any)[serviceName].TopLevelTypes[baseTypeName] = FunctionReturnValueClass;
        }

        if (baseTypeName !== 'null') {
          let proto = Object.getPrototypeOf(
            new ((microservice as any)[serviceName].Types[baseTypeName] as new () => any)()
          );
          while (proto !== Object.prototype) {
            if (
              baseTypeName !== proto.constructor.name &&
              !(microservice as any)[serviceName].Types[baseTypeName + ':' + proto.constructor.name]
            ) {
              (microservice as any)[serviceName].Types[baseTypeName + ':' + proto.constructor.name] =
                proto.constructor;
            }
            proto = Object.getPrototypeOf(proto);
          }
        }
      });
    });
}
