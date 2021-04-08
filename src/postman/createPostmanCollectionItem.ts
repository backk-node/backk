import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';

function getNestedTypeNames(typeMetadata: object, types: any, nestedTypeNames: string[]) {
  Object.values(typeMetadata ?? {}).forEach((typeName) => {
    const { baseTypeName } = getTypeInfoForTypeName(typeName);
    if (types[baseTypeName]) {
      nestedTypeNames.push(baseTypeName);
      getNestedTypeNames(types[baseTypeName], types, nestedTypeNames);
    }
  });
}

export default function createPostmanCollectionItem(
  ServiceClass: Function,
  serviceMetadata: ServiceMetadata,
  functionMetadata: FunctionMetadata,
  sampleArg: object | undefined,
  tests?: object,
  itemName?: string,
  sampleResponse?: object,
  isArrayResponse: boolean = false
) {
  const typeNames: string[] = [];

  if (functionMetadata.argType) {
    const { baseTypeName } = getTypeInfoForTypeName(functionMetadata.argType);
    typeNames.push(baseTypeName);
    getNestedTypeNames(serviceMetadata.publicTypes[baseTypeName], serviceMetadata.publicTypes, typeNames);
  }

  if (functionMetadata.returnValueType) {
    const { baseTypeName } = getTypeInfoForTypeName(functionMetadata.returnValueType);
    typeNames.push(baseTypeName);
    getNestedTypeNames(serviceMetadata.publicTypes[baseTypeName], serviceMetadata.publicTypes, typeNames);
  }

  const types = Object.entries(serviceMetadata.publicTypes).reduce((types, [typeName, typeMetadata]) => {
    if (typeNames.includes(typeName)) {
      const propertyModifiers: any = serviceMetadata.propertyModifiers[typeName];

      const newTypeMetadata = Object.entries(typeMetadata).reduce(
        (newTypeMetadata, [propertyName, typeName]) => {
          if (propertyModifiers[propertyName]) {
            return {
              ...newTypeMetadata,
              [propertyModifiers[propertyName] + ' ' + propertyName]: typeName
            };
          }
          return newTypeMetadata;
        },
        {}
      );

      return {
        ...types,
        [typeName]: newTypeMetadata
      };
    }

    return types;
  }, {});

  const typeDocs = Object.entries(serviceMetadata.typesDocumentation as any).reduce(
    (types, [typeName, typeDocs]) => {
      if (typeNames.includes(typeName)) {
        return {
          ...types,
          [typeName]: typeDocs
        };
      }
      return types;
    },
    {}
  );

  const validations = Object.entries(serviceMetadata.validations as any).reduce(
    (types, [typeName, validations]) => {
      if (typeNames.includes(typeName)) {
        return {
          ...types,
          [typeName]: validations
        };
      }
      return types;
    },
    {}
  );

  const postmanCollectionItem = {
    name: itemName ?? serviceMetadata.serviceName + '.' + functionMetadata.functionName,
    request: {
      description: {
        content:
          '### Contract\n```\n' +
          JSON.stringify({ serviceName: serviceMetadata.serviceName, ...functionMetadata }, null, 4) +
          '\n```\n' +
          '### Types\n```\n' +
          JSON.stringify(types, null, 4) +
          '\n```\n' +
          (Object.keys(typeDocs).length > 0
            ? '### Type documentation\n```\n' + JSON.stringify(typeDocs, null, 4) + '\n```\n'
            : '') +
          '### Validations\n```\n' +
          JSON.stringify(validations, null, 4) +
          '\n```\n',
        type: 'text/markdown'
      },
      method: 'POST',
      header:
        sampleArg === undefined
          ? []
          : [
              {
                key: 'Content-Type',
                name: 'Content-Type',
                value: 'application/json',
                type: 'text'
              }
            ],
      body:
        sampleArg === undefined
          ? undefined
          : {
              mode: 'raw',
              raw: JSON.stringify(sampleArg, null, 4),
              options: {
                raw: {
                  language: 'json'
                }
              }
            },
      url: {
        raw: 'http://localhost:3000/' + serviceMetadata.serviceName + '.' + functionMetadata.functionName,
        protocol: 'http',
        host: ['localhost'],
        port: '3000',
        path: [serviceMetadata.serviceName + '.' + functionMetadata.functionName]
      }
    },
    response: [],
    event: tests ? [tests] : undefined
  };

  if (sampleResponse) {
    (postmanCollectionItem as any).response = [
      {
        name: 'Response example',
        header: [
          {
            key: 'Content-Type',
            name: 'Content-Type',
            value: 'application/json',
            type: 'JSON'
          }
        ],
        body: isArrayResponse
          ? [JSON.stringify(sampleResponse, null, 4)]
          : JSON.stringify(sampleResponse, null, 4),
        code: 200
      }
    ];
  }

  return postmanCollectionItem;
}
