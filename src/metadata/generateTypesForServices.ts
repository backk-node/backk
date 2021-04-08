import BaseService from '../service/BaseService';
import generateClassFromSrcFile from '../typescript/generator/generateClassFromSrcFile';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';

export default function generateTypesForServices<T>(controller: T, remoteServiceRootDir = '') {
  return Object.entries(controller)
    .filter(
      ([serviceName, service]: [string, any]) =>
        service instanceof BaseService || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__'))
    )
    .map(([serviceName]: [string, any]) => {
      const functionNames = Object.keys(
        (controller as any)[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap
      );

      functionNames.forEach((functionName) => {
        const functionArgumentTypeName = (controller as any)[`${serviceName}__BackkTypes__`]
          .functionNameToParamTypeNameMap[functionName];

        if (
          functionArgumentTypeName !== undefined &&
          !(controller as any)[serviceName].Types[functionArgumentTypeName]
        ) {
          const FunctionArgumentClass = generateClassFromSrcFile(
            functionArgumentTypeName,
            remoteServiceRootDir
          );

          (controller as any)[serviceName].Types[functionArgumentTypeName] = FunctionArgumentClass;
          (controller as any)[serviceName].PublicTypes[functionArgumentTypeName] = FunctionArgumentClass;
        }

        if (functionArgumentTypeName !== undefined) {
          let proto = Object.getPrototypeOf(
            new ((controller as any)[serviceName].Types[functionArgumentTypeName] as new () => any)()
          );
          while (proto !== Object.prototype) {
            if (
              functionArgumentTypeName !== proto.constructor.name &&
              !(controller as any)[serviceName].Types[functionArgumentTypeName + ':' + proto.constructor.name]
            ) {
              (controller as any)[serviceName].Types[
                functionArgumentTypeName + ':' + proto.constructor.name
              ] = proto.constructor;
            }
            proto = Object.getPrototypeOf(proto);
          }
        }

        const returnValueTypeName: string = (controller as any)[`${serviceName}__BackkTypes__`]
          .functionNameToReturnTypeNameMap[functionName];

        const { baseTypeName } = getTypeInfoForTypeName(returnValueTypeName);

        if (baseTypeName !== 'null' && !(controller as any)[serviceName].Types[baseTypeName]) {
          const FunctionReturnValueClass = generateClassFromSrcFile(baseTypeName, remoteServiceRootDir);
          (controller as any)[serviceName].Types[baseTypeName] = FunctionReturnValueClass;
          (controller as any)[serviceName].PublicTypes[baseTypeName] = FunctionReturnValueClass;
        }

        if (baseTypeName !== 'null') {
          let proto = Object.getPrototypeOf(
            new ((controller as any)[serviceName].Types[baseTypeName] as new () => any)()
          );
          while (proto !== Object.prototype) {
            if (
              baseTypeName !== proto.constructor.name &&
              !(controller as any)[serviceName].Types[baseTypeName + ':' + proto.constructor.name]
            ) {
              (controller as any)[serviceName].Types[baseTypeName + ':' + proto.constructor.name] =
                proto.constructor;
            }
            proto = Object.getPrototypeOf(proto);
          }
        }
      });
    });
}
