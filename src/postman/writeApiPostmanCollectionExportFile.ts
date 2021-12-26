import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { sign } from 'jsonwebtoken';
import { Base64 } from 'js-base64';
import _ from 'lodash';
import getServiceFunctionTestArgument from './getServiceFunctionTestArgument';
import createPostmanCollectionItem from './createPostmanCollectionItem';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import getServiceFunctionExampleReturnValue from './getServiceFunctionExampleReturnValue';
import throwException from '../utils/exception/throwException';
import getNamespacedMicroserviceName from "../utils/getNamespacedMicroserviceName";

export default function writeApiPostmanCollectionExportFile<T>(
  controller: T,
  servicesMetadata: ServiceMetadata[]
) {
  const serviceItemGroups: any[] = [];

  servicesMetadata.forEach((serviceMetadata: ServiceMetadata) => {
    const functionItemGroups: any[] = [];

    serviceMetadata.functions.forEach((functionMetadata: FunctionMetadata) => {
      const items: any[] = [];

      if (
        serviceFunctionAnnotationContainer.hasOnStartUp(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        return;
      }

      const sampleArg = getServiceFunctionTestArgument(
        (controller as any)[serviceMetadata.serviceName].constructor,
        (controller as any)[serviceMetadata.serviceName].Types,
        functionMetadata.functionName,
        functionMetadata.argType,
        serviceMetadata,
        false
      );

      const { baseTypeName, isArrayType } = getTypeInfoForTypeName(functionMetadata.returnValueType);

      const exampleReturnValue = getServiceFunctionExampleReturnValue(
        (controller as any)[serviceMetadata.serviceName].Types,
        functionMetadata.functionName,
        baseTypeName,
        serviceMetadata,
        false
      );

      items.push(
        createPostmanCollectionItem(
          (controller as any)[serviceMetadata.serviceName].constructor,
          serviceMetadata,
          functionMetadata,
          sampleArg,
          undefined,
          undefined,
          exampleReturnValue,
          isArrayType
        )
      );

      functionItemGroups.push({
        name: functionMetadata.functionName,
        item: items
      });
    });

    serviceItemGroups.push({
      name: serviceMetadata.serviceName,
      item: functionItemGroups
    });
  });

  const cwd = process.cwd();
  const appName = cwd.split('/').reverse()[0];
  const payload = {};

  _.set(
    payload,
    'sub',
    'fbdb4e4a-6e93-4b08-a1e7-0b7bd08520a6'
  );

  _.set(
    payload,
    'iss',
    'http://localhost:8080/auth/realms/test'
  );

  _.set(
    payload,
    process.env.JWT_ROLES_CLAIM_PATH ??
      throwException('JWT_ROLES_CLAIM_PATH environment variable must be defined'),
    [process.env.TEST_USER_ROLE]
  );

  const jwt = sign(payload, process.env.JWT_SIGN_SECRET || 'abcdef');

  const postmanMetadata = {
    info: {
      name: appName + ' API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: Base64.encode(jwt),
          type: 'string'
        }
      ]
    },
    item: [
      {
        name: 'metadataService.getServicesMetadata',
        request: {
          method: 'POST',
          url: {
            raw: `http://localhost:${process.env.HTTP_SERVER_PORT ??
              3001}/${getNamespacedMicroserviceName()}/metadataService.getServicesMetadata`,
            protocol: 'http',
            host: ['localhost'],
            port: `${process.env.HTTP_SERVER_PORT ?? 3001}`,
            path: [getNamespacedMicroserviceName(), 'metadataService.getServicesMetadata']
          }
        }
      },
      ...serviceItemGroups
    ]
  };

  if (!existsSync(cwd + '/postman')) {
    mkdirSync(cwd + '/postman');
  }

  writeFileSync(
    process.cwd() + '/postman/apiCollection.json',
    JSON.stringify(postmanMetadata, null, 4)
  );
}
