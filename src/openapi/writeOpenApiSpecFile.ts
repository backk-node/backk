import { existsSync, mkdirSync, writeFileSync } from 'fs';
import YAML from 'yaml';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import { HttpStatusCodes } from '../constants/constants';
import isCreateFunction from '../service/crudentity/utils/isCreateFunction';
import isUpdateFunction from '../service/crudentity/utils/isUpdateFunction';
import { BACKK_ERRORS } from '../errors/backkErrors';
import isReadFunction from '../service/crudentity/utils/isReadFunction';
import isEntityTypeName from '../utils/type/isEntityTypeName';
import isEnumTypeName from '../utils/type/isEnumTypeName';

export default function writeOpenApiSpecFile<T>(microservice: T, servicesMetadata: ServiceMetadata[]) {
  const paths: { [path: string]: object } = {};
  let schemas;

  servicesMetadata.forEach((serviceMetadata: ServiceMetadata) => {
    serviceMetadata.functions.forEach((functionMetadata: FunctionMetadata) => {
      if (
        serviceFunctionAnnotationContainer.hasOnStartUp(
          (microservice as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        return;
      }

      const { baseTypeName, isArrayType } = getTypeInfoForTypeName(functionMetadata.returnValueType);
      const path = '/' + serviceMetadata.serviceName + '.' + functionMetadata.functionName;

      const errorResponseMap = functionMetadata.errors.reduce((errorResponseMap: any, errorDef) => {
        const statusCode = errorDef.statusCode ?? HttpStatusCodes.BAD_REQUEST;
        const description = '- ' + errorDef.errorCode + ': ' + errorDef.message;
        if (errorResponseMap[statusCode]) {
          errorResponseMap[statusCode] = {
            description: errorResponseMap[statusCode].description + '\n' + description
          };
        } else {
          errorResponseMap[statusCode] = {
            description
          };
        }
        return errorResponseMap;
      }, {});

      const commonErrorMap: { [key: string]: object } = {};

      if (
        isUpdateFunction(
          (microservice as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        commonErrorMap[HttpStatusCodes.CONFLICT] = {
          description:
            '1: Entity version or last modified timestamp conflict. Entity was updated before this request, please re-fetch the entity and try update again'
        };
      }

      if (
        isCreateFunction(
          (microservice as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        commonErrorMap[HttpStatusCodes.CONFLICT] = {
          description: BACKK_ERRORS.DUPLICATE_ENTITY.errorCode + ': ' + BACKK_ERRORS.DUPLICATE_ENTITY.message
        };
      }

      if (
        isReadFunction(
          (microservice as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        ) ||
        isUpdateFunction(
          (microservice as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        commonErrorMap[HttpStatusCodes.NOT_FOUND] = {
          description: BACKK_ERRORS.ENTITY_NOT_FOUND.errorCode + ': ' + BACKK_ERRORS.ENTITY_NOT_FOUND.message
        };
      }

      if (functionMetadata.argType !== 'void') {
        commonErrorMap[HttpStatusCodes.BAD_REQUEST] = {
          description: BACKK_ERRORS.INVALID_ARGUMENT.errorCode + ': ' + BACKK_ERRORS.INVALID_ARGUMENT.message
        };
      }

      commonErrorMap[HttpStatusCodes.FORBIDDEN] = {
        description:
          BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.errorCode +
          ': ' +
          BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.message
      };

      commonErrorMap[HttpStatusCodes.UNPROCESSABLE_ENTITY] = {
        description:
          BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.errorCode +
          ': ' +
          BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message
      };

      commonErrorMap[HttpStatusCodes.NOT_ACCEPTABLE] = {
        description:
          BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT.errorCode +
          ': ' +
          BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT.message
      };

      commonErrorMap[HttpStatusCodes.PAYLOAD_TOO_LARGE] = {
        description:
          BACKK_ERRORS.REQUEST_IS_TOO_LONG.errorCode + ': ' + BACKK_ERRORS.REQUEST_IS_TOO_LONG.message
      };

      commonErrorMap[HttpStatusCodes.UNAUTHORIZED] = {
        description:
          BACKK_ERRORS.USER_NOT_AUTHENTICATED.errorCode + ': ' + BACKK_ERRORS.USER_NOT_AUTHENTICATED.message
      };

      paths[path] = {
        summary: serviceMetadata.serviceName,
        description: serviceMetadata.serviceDocumentation,
        post: {
          summary: functionMetadata.functionName,
          description: functionMetadata.documentation,
          ...(functionMetadata.argType === 'void'
            ? {}
            : {
                requestBody: {
                  description: functionMetadata.argType,
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/' + functionMetadata.argType
                      }
                    }
                  }
                }
              }),
          responses: {
            '200': {
              description: 'Successful operation',
              ...(baseTypeName === 'void'
                ? {}
                : {
                    content: {
                      'application/json': {
                        schema: {
                          ...(isArrayType
                            ? {
                                type: 'array',
                                items: {
                                  $ref: '#/components/schemas/' + baseTypeName
                                }
                              }
                            : { $ref: '#/components/schemas/' + baseTypeName })
                        }
                      }
                    }
                  })
            },
            ...errorResponseMap,
            ...commonErrorMap
          }
        }
      };
    });

    schemas = Object.entries(serviceMetadata.publicTypes).reduce((schemas, [typeName, typeSpec]) => {
      const required: string[] = [];

      const properties = Object.entries(typeSpec).reduce((properties, [propertyName, propertyTypeName]) => {
        const { baseTypeName, isArrayType, isOptionalType, isNullableType } = getTypeInfoForTypeName(
          propertyTypeName
        );

        if (isOptionalType) {
          required.push(propertyName);
        }

        const minimum: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ]?.reduce((minimum: number | undefined, validation: string) => {
          if (validation.startsWith('min(')) {
            const valueStr = validation.slice(4, -1);
            return propertyTypeName === 'integer' ? parseInt(valueStr, 10) : parseFloat(valueStr);
          }
          if (validation.startsWith('minMax(')) {
            const valueStr = validation.split(',')[0].slice(7);
            return propertyTypeName === 'integer' ? parseInt(valueStr, 10) : parseFloat(valueStr);
          }
          return minimum;
        }, undefined);

        const maximum: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ]?.reduce((maximum: number | undefined, validation: string) => {
          if (validation.startsWith('max(')) {
            const valueStr = validation.slice(4, -1);
            return propertyTypeName === 'integer' ? parseInt(valueStr, 10) : parseFloat(valueStr);
          }
          if (validation.startsWith('minMax(')) {
            const valueStr = validation.split(',')[1].slice(0, -1);
            return propertyTypeName === 'integer' ? parseInt(valueStr, 10) : parseFloat(valueStr);
          }
          return maximum;
        }, undefined);

        const multipleOf: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ]?.reduce((multipleOf: number | undefined, validation: string) => {
          if (validation.startsWith('isDivisibleBy(')) {
            const valueStr = validation.slice('isDivisibleBy('.length, -1);
            return parseInt(valueStr, 10);
          }
          return multipleOf;
        }, undefined);

        const minLength: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ].reduce((minLength: number | undefined, validation: string) => {
          if (validation.startsWith('minLength(')) {
            const valueStr = validation.slice('minLength('.length, -1);
            return parseInt(valueStr, 10);
          }
          if (validation.startsWith('length(')) {
            const valueStr = validation.split(',')[0].split('(')[1];
            return parseInt(valueStr, 10);
          }
          if (validation.startsWith('lengthAndMatches(')) {
            const valueStr = validation.split(',')[0].split('(')[1];
            return parseInt(valueStr, 10);
          }
          return minLength;
        }, undefined);

        const maxLength: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ].reduce((maxLength: number | undefined, validation: string) => {
          if (validation.startsWith('maxLength(')) {
            const valueStr = validation.slice('maxLength('.length, -1);
            return parseInt(valueStr, 10);
          }
          if (validation.startsWith('length(')) {
            const valueStr = validation.split(',')[1].slice(0, -1);
            return parseInt(valueStr, 10);
          }
          if (validation.startsWith('lengthAndMatches(')) {
            const valueStr = validation.split(',')[2];
            return parseInt(valueStr, 10);
          }
          if (validation.startsWith('maxLengthAndMatches(')) {
            const valueStr = validation.split(',')[0].split('(')[1];
            return parseInt(valueStr, 10);
          }
          return maxLength;
        }, undefined);

        const pattern: string | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ].reduce((pattern: string | undefined, validation: string) => {
          if (validation.startsWith('lengthAndMatches(')) {
            return validation.split(',')[3].slice(1, -2);
          }
          if (validation.startsWith('maxLengthAndMatches(')) {
            return validation.split(',')[2].slice(1, -2);
          }
          return pattern;
        }, undefined);

        let format: string | undefined;
        if (baseTypeName === 'string') {
          format = (serviceMetadata.validations as any)[typeName][propertyName]?.reduce(
            (format: string | undefined, validation: string) => {
              if (
                validation !== 'isString()' &&
                validation !== 'isStringOrObjectId()' &&
                validation !== 'isAnyString()' &&
                validation.startsWith('is')
              ) {
                return validation.endsWith('()')
                  ? validation.slice(2, -2).toLowerCase()
                  : validation.slice(2).toLowerCase();
              }
              return format;
            },
            undefined
          );
        }

        const minItems: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ]?.reduce((minItems: number | undefined, validation: string) => {
          if (validation.startsWith('minArraySize(')) {
            const valueStr = validation.slice('minArraySize('.length, -1);
            return parseInt(valueStr, 10);
          }
          return minItems;
        }, undefined);

        const maxItems: number | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ]?.reduce((maxItems: number | undefined, validation: string) => {
          if (validation.startsWith('maxArraySize(')) {
            const valueStr = validation.slice('maxArraySize('.length, -1);
            return parseInt(valueStr, 10);
          }
          return maxItems;
        }, undefined);

        const uniqueItems: boolean | undefined = (serviceMetadata.validations as any)[typeName][
          propertyName
        ]?.reduce((uniqueItems: number | undefined, validation: string) => {
          if (validation === 'arrayUnique') {
            return true;
          }
          return uniqueItems;
        }, undefined);

        const readonly: boolean | undefined = (serviceMetadata.propertyModifiers as any)[typeName][
          propertyName
        ]?.reduce((readonly: boolean | undefined, propertyModifier: string) => {
          if (propertyModifier.includes('readonly')) {
            return true;
          }
          return uniqueItems;
        }, undefined);

        let type;
        if (isEnumTypeName(baseTypeName)) {
          const enumValues = baseTypeName.slice(1, -1).split('|');
          const enumType = enumValues[0].startsWith("'") ? 'string' : 'number';

          if (isArrayType) {
            type = { type: 'array', items: { type: enumType, enum: enumValues } };
          } else {
            type = { type: enumType, enum: enumValues };
          }
        } else if (isEntityTypeName(baseTypeName)) {
          if (isArrayType) {
            type = { type: 'array', items: { $ref: '#/components/schemas/' + propertyTypeName } };
          } else {
            type = { $ref: '#/components/schemas/' + propertyTypeName };
          }
        } else if (propertyTypeName.startsWith('Date')) {
          if (isArrayType) {
            type = { type: 'array', items: { type: 'string' } };
          } else {
            type = { type: 'string' };
          }
        } else {
          if (isArrayType) {
            type = { type: 'array', items: { type: propertyTypeName } };
          } else {
            type = { type: propertyTypeName };
          }
        }

        properties[propertyName] = {
          description: (serviceMetadata.typesDocumentation as any)?.[typeName][propertyName],
          ...type,
          minimum,
          maximum,
          multipleOf,
          minLength,
          maxLength,
          nullable: isNullableType,
          ...(propertyTypeName.startsWith('Date') ? { format: 'date-time' } : {}),
          ...(propertyName.toLowerCase().includes('password') ? { format: 'password ' } : {}),
          format,
          pattern,
          minItems,
          maxItems,
          uniqueItems,
          readonly
        };

        return properties;
      }, {} as { [key: string]: object });

      schemas[typeName] = {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {})
      };

      return schemas;
    }, {} as { [key: string]: object });
  });

  const cwd = process.cwd();
  const appName = cwd.split('/').reverse()[0];

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: appName + ' API',
      description: process.env.MICROSERVICE_DESCRIPTION ?? '',
      version: process.env.npm_package_version
    },
    servers: [
      {
        url: `http://localhost:${process.env.HTTP_SERVER_PORT ?? 3000}`,
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas
    },
    security: [{ bearerAuth: [] }],
    paths
  };

  if (!existsSync(cwd + '/openapi')) {
    mkdirSync(cwd + '/openapi');
  }

  writeFileSync(process.cwd() + '/openapi/openApiSpec.yaml', YAML.stringify(openApiSpec));
}
