import { existsSync, mkdirSync, writeFileSync } from "fs";
import YAML from "yaml";
import { HttpStatusCodes } from "../constants/constants";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
import { BACKK_ERRORS } from "../errors/BACKK_ERRORS";
import { FunctionMetadata } from "../metadata/types/FunctionMetadata";
import { ServiceMetadata } from "../metadata/types/ServiceMetadata";
import getServiceFunctionExampleReturnValue from "../postman/getServiceFunctionExampleReturnValue";
import getServiceFunctionTestArgument from "../postman/getServiceFunctionTestArgument";
import isCreateFunction from "../services/crudentity/utils/isCreateFunction";
import isReadFunction from "../services/crudentity/utils/isReadFunction";
import isUpdateFunction from "../services/crudentity/utils/isUpdateFunction";
import getNamespacedMicroserviceName from "../utils/getNamespacedMicroserviceName";
import getTypeInfoForTypeName from "../utils/type/getTypeInfoForTypeName";
import { ErrorDefinition } from "../types/ErrorDefinition";
import { BackkError } from "../types/BackkError";

function getErrorContent(error: ErrorDefinition | BackkError) {
  return {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/BackkError',
        },
        example: error,
      },
    },
  };
}

const cachedOpenApiSpec: { [key: string]: object } = {};

export function getOpenApiSpec<T>(microservice: T, servicesMetadata: ServiceMetadata[], directory: string) {
  if (cachedOpenApiSpec[directory]) {
    return cachedOpenApiSpec[directory];
  }

  const paths: { [path: string]: object } = {};
  let schemas: any = {};

  servicesMetadata.forEach((serviceMetadata: ServiceMetadata) => {
    const cronJobFunctionArgNames = new Set<string>();
    serviceMetadata.functions.forEach((functionMetadata: FunctionMetadata) => {
      const ServiceClass = (microservice as any)[serviceMetadata.serviceName].constructor;

      if (
        process.env.NODE_ENV === 'production' &&
        serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
          ServiceClass,
          functionMetadata.functionName
        )
      ) {
        return;
      }

      const requestExample = getServiceFunctionTestArgument(
        (microservice as any)[serviceMetadata.serviceName].constructor,
        (microservice as any)[serviceMetadata.serviceName].Types,
        functionMetadata.functionName,
        functionMetadata.argType,
        serviceMetadata,
        false
      );

      const { baseTypeName, isArrayType, isNull } = getTypeInfoForTypeName(functionMetadata.returnValueType);
      const path = '/' + serviceMetadata.serviceName + '.' + functionMetadata.functionName;

      const responseExample = getServiceFunctionExampleReturnValue(
        (microservice as any)[serviceMetadata.serviceName].Types,
        functionMetadata.functionName,
        baseTypeName,
        serviceMetadata,
        false
      );

      const errorResponseMap = functionMetadata.errors.reduce((errorResponseMap: any, error) => {
        const statusCode = error.statusCode ?? HttpStatusCodes.BAD_REQUEST;
        const description = '- ' + error.errorCode + ': ' + error.message;
        if (errorResponseMap[statusCode]) {
          errorResponseMap[statusCode] = {
            ...errorResponseMap[statusCode],
            description: errorResponseMap[statusCode].description + '\n' + description,
          };
        } else {
          errorResponseMap[statusCode] = {
            description,
            ...getErrorContent(error),
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
            '1: Entity version or last modified timestamp conflict. Entity was updated before this request, please re-fetch the entity and try update again',
          ...getErrorContent(BACKK_ERRORS.ENTITY_VERSION_MISMATCH),
        };
      }

      if (
        isCreateFunction(
          (microservice as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        commonErrorMap[HttpStatusCodes.CONFLICT] = {
          description: BACKK_ERRORS.DUPLICATE_ENTITY.errorCode + ': ' + BACKK_ERRORS.DUPLICATE_ENTITY.message,
          ...getErrorContent(BACKK_ERRORS.DUPLICATE_ENTITY),
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
          description: BACKK_ERRORS.ENTITY_NOT_FOUND.errorCode + ': ' + BACKK_ERRORS.ENTITY_NOT_FOUND.message,
          ...getErrorContent(BACKK_ERRORS.ENTITY_NOT_FOUND),
        };
      }

      if (functionMetadata.argType !== undefined) {
        commonErrorMap[HttpStatusCodes.BAD_REQUEST] = {
          description: BACKK_ERRORS.INVALID_ARGUMENT.errorCode + ': ' + BACKK_ERRORS.INVALID_ARGUMENT.message,
          ...getErrorContent(BACKK_ERRORS.INVALID_ARGUMENT),
        };
      }

      if (
        serviceMetadata.serviceName !== 'metadataService' &&
        (microservice as any)[serviceMetadata.serviceName].getServiceType() !== 'LivenessCheckService' &&
        (microservice as any)[serviceMetadata.serviceName].getServiceType() !== 'ReadinessCheckService' &&
        (microservice as any)[serviceMetadata.serviceName].getServiceType() !== 'StartupCheckService'
      ) {
        commonErrorMap[HttpStatusCodes.UNAUTHORIZED] = {
          description:
            BACKK_ERRORS.USER_NOT_AUTHENTICATED.errorCode + ': ' + BACKK_ERRORS.USER_NOT_AUTHENTICATED.message,
          ...getErrorContent(BACKK_ERRORS.USER_NOT_AUTHENTICATED),
        };

        commonErrorMap[HttpStatusCodes.FORBIDDEN] = {
          description:
            BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.errorCode +
            ': ' +
            BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.message,
          ...getErrorContent(BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED),
        };
      }

      if (functionMetadata.argType !== undefined) {
        commonErrorMap[HttpStatusCodes.UNPROCESSABLE_ENTITY] = {
          description:
            BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.errorCode +
            ': ' +
            BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message,
          ...getErrorContent(BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED),
        };

        commonErrorMap[HttpStatusCodes.NOT_ACCEPTABLE] = {
          description:
            BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT.errorCode +
            ': ' +
            BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT.message,
          ...getErrorContent(BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT),
        };

        commonErrorMap[HttpStatusCodes.PAYLOAD_TOO_LARGE] = {
          description:
            BACKK_ERRORS.REQUEST_IS_TOO_LONG.errorCode + ': ' + BACKK_ERRORS.REQUEST_IS_TOO_LONG.message,
          ...getErrorContent(BACKK_ERRORS.REQUEST_IS_TOO_LONG),
        };
      }

      paths[path] = {
        post: {
          summary: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
          ...(functionMetadata.documentation ? { description: functionMetadata.documentation } : {}),
          tags: [serviceMetadata.serviceName],
          ...(functionMetadata.argType === undefined
            ? {}
            : {
                requestBody: {
                  description: functionMetadata.argType,
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/' + functionMetadata.argType,
                      },
                      example: requestExample,
                    },
                  },
                },
              }),
          responses: {
            '200': {
              description: 'Successful operation',
              ...(isNull
                ? {}
                : {
                    content: {
                      'application/json': {
                        schema: {
                          ...(isArrayType
                            ? {
                                type: 'array',
                                items: {
                                  $ref: '#/components/schemas/' + baseTypeName,
                                },
                              }
                            : { $ref: '#/components/schemas/' + baseTypeName }),
                        },
                        example: responseExample,
                      },
                    },
                  }),
            },
            ...errorResponseMap,
            ...commonErrorMap,
          },
        },
      };
    });

    schemas = Object.assign(
      schemas,
      Object.entries(serviceMetadata.types).reduce((schemas, [typeName, typeSpec]) => {
        if (typeName === 'DbTableVersion' || cronJobFunctionArgNames.has(typeName)) {
          return schemas;
        }

        const required: string[] = [];

        const properties = Object.entries(typeSpec).reduce((properties, [propertyName, propertyTypeName]) => {
          const { baseTypeName, isArrayType, isOptionalType, isNullableType } =
            getTypeInfoForTypeName(propertyTypeName);

          const minimum: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
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

          const maximum: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
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

          const multipleOf: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((multipleOf: number | undefined, validation: string) => {
            if (validation.startsWith('isDivisibleBy(')) {
              const valueStr = validation.slice('isDivisibleBy('.length, -1);
              return parseInt(valueStr, 10);
            }
            return multipleOf;
          }, undefined);

          const minLength: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((minLength: number | undefined, validation: string) => {
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

          const maxLength: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((maxLength: number | undefined, validation: string) => {
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

          const pattern: string | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((pattern: string | undefined, validation: string) => {
            if (validation.startsWith('lengthAndMatches(')) {
              const [, , patternStart, ...rest] = validation.split(',');
              const patternStr = patternStart + (rest.length > 0 ? ',' + rest.join(',') : '');
              return patternStr.endsWith('/, { each: true })')
                ? patternStr.slice(2, -'/, { each: true })'.length)
                : patternStr.slice(2, -2);
            }
            if (validation.startsWith('maxLengthAndMatches(')) {
              const [, patternStart, ...rest] = validation.split(',');
              const patternStr = patternStart + (rest.length > 0 ? ',' + rest.join(',') : '');
              return patternStr.endsWith('/, { each: true })')
                ? patternStr.slice(2, -'/, { each: true })'.length)
                : patternStr.slice(2, -2);
            }
            return pattern;
          }, undefined);

          let format: string | undefined;
          if (baseTypeName === 'string') {
            format = (serviceMetadata.validations as any)[typeName]?.[propertyName]?.reduce(
              (format: string | undefined, validation: string) => {
                if (
                  !validation.startsWith('isString(') &&
                  !validation.startsWith('isStringOrObjectId(') &&
                  !validation.startsWith('isAnyString(') &&
                  !validation.startsWith('isArray') &&
                  validation.startsWith('is')
                ) {
                  return validation;
                }
                return format;
              },
              undefined
            );
          }

          const minItems: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((minItems: number | undefined, validation: string) => {
            if (validation.startsWith('arrayMinSize(')) {
              const valueStr = validation.slice('arrayMinSize('.length, -1);
              return parseInt(valueStr, 10);
            }
            return minItems;
          }, undefined);

          const maxItems: number | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((maxItems: number | undefined, validation: string) => {
            if (validation.startsWith('arrayMaxSize(')) {
              const valueStr = validation.slice('arrayMaxSize('.length, -1);
              return parseInt(valueStr, 10);
            }
            return maxItems;
          }, undefined);

          const uniqueItems: boolean | undefined = (serviceMetadata.validations as any)[typeName]?.[
            propertyName
          ]?.reduce((uniqueItems: number | undefined, validation: string) => {
            if (validation === 'arrayUnique()') {
              return true;
            }
            return uniqueItems;
          }, undefined);

          const readOnly: boolean | undefined = (serviceMetadata.propertyAccess as any)[typeName]?.[
            propertyName
          ]?.includes('@ReadOnly()')
            ? true
            : undefined;

          const writeOnly: boolean | undefined = (serviceMetadata.propertyAccess as any)[typeName]?.[
            propertyName
          ]?.includes('@WriteOnly()')
            ? true
            : undefined;

          let type;
          if (baseTypeName[0] === '(') {
            const enumValueStrs = baseTypeName.slice(1, -1).split('|');
            const enumType = enumValueStrs[0].startsWith("'") ? 'string' : 'number';
            let enumValues: string[] | number[];
            if (enumType === 'number') {
              enumValues = enumValueStrs.map((enumValueStr) => parseInt(enumValueStr, 10));
            } else {
              enumValues = enumValueStrs.map((enumValueStr) => enumValueStr.slice(1, -1));
            }

            if (isArrayType) {
              type = { type: 'array', items: { type: enumType, enum: enumValues } };
            } else {
              type = { type: enumType, enum: enumValues };
            }
          } else if (baseTypeName[0] === baseTypeName[0].toUpperCase() && baseTypeName !== 'Date') {
            if (isArrayType) {
              type = { type: 'array', items: { $ref: '#/components/schemas/' + baseTypeName } };
            } else {
              type = { $ref: '#/components/schemas/' + baseTypeName };
            }
          } else if (baseTypeName === 'Date' || baseTypeName === 'bigint') {
            if (isArrayType) {
              type = { type: 'array', items: { type: 'string' } };
            } else {
              type = { type: 'string' };
            }
          } else {
            if (isArrayType) {
              type = { type: 'array', items: { type: baseTypeName } };
            } else {
              type = { type: baseTypeName };
            }
          }

          if (isArrayType) {
            (type as any).items = {
              ...type.items,
              ...(minimum === undefined ? {} : { minimum }),
              ...(maximum === undefined ? {} : { maximum }),
              ...(multipleOf === undefined ? {} : { multipleOf }),
              ...(minLength === undefined ? {} : { minLength }),
              ...(maxLength === undefined ? {} : { maxLength }),
              ...(propertyTypeName.startsWith('Date') ? { format: 'date-time' } : {}),
              ...(propertyName.toLowerCase().includes('password') ? { format: 'password ' } : {}),
              ...(format === undefined ? {} : { format }),
              ...(pattern === undefined ? {} : { pattern }),
            };
          }

          const propertyDocumentation = (serviceMetadata.typesDocumentation as any)[typeName]?.[propertyName];
          properties[propertyName] = {
            ...(propertyDocumentation ? { description: propertyDocumentation } : {}),
            ...type,
            ...(minimum === undefined || isArrayType ? {} : { minimum }),
            ...(maximum === undefined || isArrayType ? {} : { maximum }),
            ...(multipleOf === undefined || isArrayType ? {} : { multipleOf }),
            ...(minLength === undefined || isArrayType ? {} : { minLength }),
            ...(maxLength === undefined || isArrayType ? {} : { maxLength }),
            ...(isNullableType ? { nullable: isNullableType } : {}),
            ...(propertyTypeName.startsWith('Date') && !isArrayType ? { format: 'date-time' } : {}),
            ...(propertyName.toLowerCase().includes('password') && !isArrayType
              ? { format: 'password ' }
              : {}),
            ...(format === undefined || isArrayType ? {} : { format }),
            ...(pattern === undefined || isArrayType ? {} : { pattern }),
            ...(minItems === undefined ? {} : { minItems }),
            ...(maxItems === undefined ? {} : { maxItems }),
            ...(uniqueItems === undefined ? {} : { uniqueItems }),
            ...(readOnly === undefined ? {} : { readOnly }),
            ...(writeOnly === undefined ? {} : { writeOnly }),
          };

          if (!isOptionalType) {
            required.push(propertyName);
          }

          return properties;
        }, {} as { [key: string]: object });

        schemas[typeName] = {
          type: 'object',
          properties,
          ...(required.length > 0 ? { required } : {}),
        };

        return schemas;
      }, {} as { [key: string]: object })
    );
  });

  const cwd = process.cwd();
  const appName = cwd.split('/').reverse()[0];

  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: appName + ' API',
      description: process.env.MICROSERVICE_DESCRIPTION ?? '',
      version: process.env.MICROSERVICE_VERSION ?? process.env.npm_package_version,
      ...(process.env.API_TERMS_OF_SERVICE_URL
        ? { termsOfService: process.env.API_TERMS_OF_SERVICE_URL }
        : {}),
      ...(process.env.API_CONTACT_NAME
        ? {
            contact: {
              ...(process.env.API_CONTACT_NAME ? { name: process.env.API_CONTACT_NAME } : {}),
              ...(process.env.API_CONTACT_EMAIL ? { email: process.env.API_CONTACT_EMAIL } : {}),
              ...(process.env.API_CONTACT_URL ? { url: process.env.API_CONTACT_URL } : {}),
            },
          }
        : {}),
      ...(process.env.API_LICENSE_NAME
        ? {
            license: {
              ...(process.env.API_LICENSE_NAME ? { name: process.env.API_LICENSE_NAME } : {}),
              ...(process.env.API_LICENSE_URL ? { url: process.env.API_LICENSE_URL } : {}),
            },
          }
        : {}),
      ...(process.env.API_EXTERNAL_DOCS_URL
        ? {
            externalDocs: {
              description: 'Find more about ' + appName + ' API',
              url: process.env.API_EXTERNAL_DOCS_URL,
            },
          }
        : {}),
    },
    servers:
      process.env.NODE_ENV === 'development'
        ? [
            {
              url: `http://localhost:${
                process.env.HTTP_SERVER_PORT ?? 3001
              }/${getNamespacedMicroserviceName()}`,
              description: 'Local development server',
            },
          ]
        : [
            {
              url: `https://${process.env.API_GATEWAY_FQDN}/${getNamespacedMicroserviceName()}`,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              description: process.env.NODE_ENV!.toUpperCase() + process.env.NODE_ENV!.slice(1) + ' server',
            },
          ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        openId: process.env.OPEN_ID_CONNECT_URL
          ? {
              type: 'openIdConnect',
              openIdConnectUrl: process.env.OPEN_ID_CONNECT_URL,
            }
          : undefined,
      },
      schemas,
    },
    security: [{ bearerAuth: [] }, ...(process.env.OPEN_ID_CONNECT_URL ? [{ openId: [] }] : [])],
    paths,
  };

  if (process.env.CI_API_GATEWAY_FQDN) {
    openApiSpec.servers.push({
      url: `https://${process.env.CI_API_GATEWAY_FQDN}/${getNamespacedMicroserviceName()}`,
      description: 'CI server',
    });
  }

  if (process.env.STAGING_API_GATEWAY_FQDN) {
    openApiSpec.servers.push({
      url: `https://${process.env.STAGING_API_GATEWAY_FQDN}/${getNamespacedMicroserviceName()}`,
      description: 'Staging server',
    });
  }

  if (process.env.PRODUCTION_API_GATEWAY_FQDN) {
    openApiSpec.servers.push({
      url: `https://${process.env.PRODUCTION_API_GATEWAY_FQDN}/${getNamespacedMicroserviceName()}`,
      description: 'Production server',
    });
  }

  if (!cachedOpenApiSpec[directory]) {
    cachedOpenApiSpec[directory] = openApiSpec;
  }

  return openApiSpec;
}

export default function writeOpenApiSpecFile<T>(
  microservice: T,
  servicesMetadata: ServiceMetadata[],
  directory: string
) {
  const openApiSpec = getOpenApiSpec(microservice, servicesMetadata, directory);

  const cwd = process.cwd();

  if (!existsSync(cwd + '/generated')) {
    mkdirSync(cwd + '/generated');
  }

  if (!existsSync(cwd + '/generated/openapi')) {
    mkdirSync(cwd + '/generated/openapi');
  }

  writeFileSync(
    process.cwd() + `/generated/openapi/openApi${directory[0].toUpperCase()}${directory.slice(1)}Spec.yaml`,
    YAML.stringify(openApiSpec)
  );
}
