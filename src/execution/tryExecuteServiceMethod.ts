import { plainToClass } from 'class-transformer';
import _ from 'lodash';
import Redis from 'ioredis';
import { MemoryCache } from 'memory-cache-node';
import tryAuthorize from '../authorization/tryAuthorize';
import BaseService from '../service/BaseService';
import tryVerifyCaptchaToken from '../captcha/tryVerifyCaptchaToken';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import UserAccountBaseService from '../service/useraccount/UserAccountBaseService';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import tryValidateServiceFunctionArgument from '../validation/tryValidateServiceFunctionArgument';
import tryValidateServiceFunctionReturnValue from '../validation/tryValidateServiceFunctionReturnValue';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import createBackkErrorFromError from '../errors/createBackkErrorFromError';
import log, { Severity } from '../observability/logging/log';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import { HttpStatusCodes, MAX_INT_VALUE, Values } from '../constants/constants';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import AuditLoggingService from '../observability/logging/audit/AuditLoggingService';
import createAuditLogEntry from '../observability/logging/audit/createAuditLogEntry';
import executeMultipleServiceFunctions from './executeMultipleServiceFunctions';
import tryScheduleJobExecution from '../scheduling/tryScheduleJobExecution';
import isExecuteMultipleRequest from './isExecuteMultipleRequest';
import createErrorFromErrorCodeMessageAndStatus from '../errors/createErrorFromErrorCodeMessageAndStatus';
import { BackkError } from '../types/BackkError';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../errors/backkErrors';
import emptyError from '../errors/emptyError';
import fetchFromRemoteServices from './fetchFromRemoteServices';
import getClsNamespace from '../continuationlocalstorage/getClsNamespace';
import getMicroserviceServiceByServiceClass from '../microservice/getMicroserviceServiceByServiceClass';
import AuthorizationService from '../authorization/AuthorizationService';
import throwException from '../utils/exception/throwException';
import ResponseCacheConfigService from '../cache/ResponseCacheConfigService';
import LivenessCheckService from '../service/LivenessCheckService';
import getMicroserviceServiceNameByServiceClass from '../microservice/getMicroserviceServiceNameByServiceClass';
import ReadinessCheckService from '../service/ReadinessCheckService';
import StartupCheckService from '../service/startup/StartupCheckService';
import throwIf from '../utils/exception/throwIf';
import { getDefaultOrThrowExceptionInProduction } from '../utils/exception/getDefaultOrThrowExceptionInProduction';
import { getOpenApiSpec } from '../openapi/writeOpenApiSpecFile';
import {
  generateInternalServicesMetadata,
  generatePublicServicesMetadata
} from '../microservice/initializeMicroservice';
import isBackkError from '../errors/isBackkError';

export interface ServiceFunctionExecutionOptions {
  isMetadataServiceEnabled?: boolean;
  httpGetRequests?: {
    regExpForAllowedServiceFunctionNames?: RegExp;
    deniedServiceFunctionNames?: string[];
  };
  multipleServiceFunctionExecution?: {
    isAllowed?: boolean;
    maxServiceFunctionCount?: number;
    shouldAllowTemplates?: boolean;
    regExpForAllowedRemoteServiceFunctionCalls?: RegExp;
  };
}

const subjectCache = new MemoryCache(5 * 60, Values._100K);

export default async function tryExecuteServiceMethod(
  microservice: any,
  serviceFunctionName: string,
  serviceFunctionArgument: any,
  headers: { [key: string]: string | string[] | undefined },
  httpMethod: string,
  resp: any,
  isClusterInternalCall: boolean,
  options?: ServiceFunctionExecutionOptions
): Promise<void | object> {
  let storedError;
  let subject: string | undefined;
  let response: any;
  // eslint-disable-next-line prefer-const
  let [serviceName, functionName] = serviceFunctionName.split('.');

  try {
    if (httpMethod !== 'GET' && httpMethod !== 'POST') {
      throw createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.INVALID_HTTP_METHOD);
    }

    if (
      options?.multipleServiceFunctionExecution?.isAllowed &&
      isExecuteMultipleRequest(serviceFunctionName)
    ) {
      if (options?.multipleServiceFunctionExecution.maxServiceFunctionCount) {
        if (
          Object.keys(serviceFunctionArgument).length >
          options?.multipleServiceFunctionExecution.maxServiceFunctionCount
        ) {
          throw createBackkErrorFromErrorCodeMessageAndStatus({
            ...BACKK_ERRORS.INVALID_ARGUMENT,
            message: BACKK_ERRORS.INVALID_ARGUMENT.message + 'too many service functions called'
          });
        }
      } else {
        throw new Error('Missing maxServiceFunctionCountInMultipleServiceFunctionExecution option');
      }

      if (serviceFunctionName === 'executeMultipleInParallelWithoutTransaction') {
        return await executeMultipleServiceFunctions(
          true,
          false,
          microservice,
          serviceFunctionArgument,
          headers,
          resp,
          isClusterInternalCall,
          options
        );
      } else if (serviceFunctionName === 'executeMultipleInSequenceWithoutTransaction') {
        return await executeMultipleServiceFunctions(
          false,
          false,
          microservice,
          serviceFunctionArgument,
          headers,
          resp,
          isClusterInternalCall,
          options
        );
      } else if (serviceFunctionName === 'executeMultipleInParallelInsideTransaction') {
        return await executeMultipleServiceFunctions(
          true,
          true,
          microservice,
          serviceFunctionArgument,
          headers,
          resp,
          isClusterInternalCall,
          options
        );
      } else if (serviceFunctionName === 'executeMultipleInSequenceInsideTransaction') {
        return executeMultipleServiceFunctions(
          false,
          true,
          microservice,
          serviceFunctionArgument,
          headers,
          resp,
          isClusterInternalCall,
          options
        );
      }
    }

    log(Severity.DEBUG, 'Service function call', serviceFunctionName);
    defaultServiceMetrics.incrementServiceFunctionCallsByOne(serviceFunctionName);

    const serviceFunctionCallStartTimeInMillis = Date.now();

    if (serviceFunctionName === 'scheduleJobExecution') {
      return await tryScheduleJobExecution(microservice, serviceFunctionArgument, headers, resp);
    }

    if (httpMethod === 'GET') {
      if (
        !serviceFunctionName.match(
          options?.httpGetRequests?.regExpForAllowedServiceFunctionNames ?? /^[a-z][A-Za-z0-9]*\.get/
        ) ||
        options?.httpGetRequests?.deniedServiceFunctionNames?.includes(serviceFunctionName)
      ) {
        throw createErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.HTTP_METHOD_MUST_BE_POST);
      }

      // noinspection AssignmentToFunctionParameterJS
      serviceFunctionArgument = decodeURIComponent(serviceFunctionArgument);

      try {
        // noinspection AssignmentToFunctionParameterJS
        serviceFunctionArgument = JSON.parse(serviceFunctionArgument);
      } catch (error) {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message:
            BACKK_ERRORS.INVALID_ARGUMENT.message +
            'argument not valid or too long. Argument must be a URI encoded JSON string'
        });
      }
    }

    if (serviceFunctionName === 'metadataService.getOpenApiSpec') {
      if (!options || options.isMetadataServiceEnabled === undefined || options.isMetadataServiceEnabled) {
        resp.writeHead(HttpStatusCodes.SUCCESS, { 'Content-Type': 'application/json' });
        resp.end(
          JSON.stringify(
            getOpenApiSpec(
              microservice,
              isClusterInternalCall
                ? microservice.internalServicesMetadata ?? generateInternalServicesMetadata(microservice)
                : microservice.publicServicesMetadata ?? generatePublicServicesMetadata(microservice),
              isClusterInternalCall ? 'internal' : 'public'
            )
          )
        );
        return;
      } else {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.UNKNOWN_SERVICE,
          message: BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
        });
      }
    } else if (serviceFunctionName === 'metadataService.getServicesMetadata') {
      if (!options || options.isMetadataServiceEnabled === undefined || options.isMetadataServiceEnabled) {
        resp.writeHead(HttpStatusCodes.SUCCESS, { 'Content-Type': 'application/json' });
        resp.end(
          JSON.stringify({
            services: isClusterInternalCall
              ? microservice.internalServicesMetadata ?? generateInternalServicesMetadata(microservice)
              : microservice.publicServicesMetadata ?? generatePublicServicesMetadata(microservice),
            commonErrors: BACKK_ERRORS
          })
        );
        return;
      } else {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.UNKNOWN_SERVICE,
          message: BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
        });
      }
    } else if (serviceFunctionName === 'livenessCheckService.isMicroserviceAlive') {
      if (getMicroserviceServiceByServiceClass(microservice, LivenessCheckService)) {
        serviceName = getMicroserviceServiceNameByServiceClass(microservice, LivenessCheckService);
        // noinspection AssignmentToFunctionParameterJS
        serviceFunctionName = serviceName + '.' + 'isMicroserviceAlive';
      } else {
        resp.writeHead(HttpStatusCodes.SUCCESS);
        resp.end();
        return;
      }
    } else if (serviceFunctionName === 'readinessCheckService.isMicroserviceReady') {
      if (getMicroserviceServiceByServiceClass(microservice, ReadinessCheckService)) {
        serviceName = getMicroserviceServiceNameByServiceClass(microservice, ReadinessCheckService);
        // noinspection AssignmentToFunctionParameterJS
        serviceFunctionName = serviceName + '.' + 'isMicroserviceReady';
      } else {
        resp.writeHead(HttpStatusCodes.SUCCESS);
        resp.end();
        return;
      }
    } else if (serviceFunctionName === 'startupCheckService.isMicroserviceStarted') {
      if (getMicroserviceServiceByServiceClass(microservice, StartupCheckService)) {
        serviceName = getMicroserviceServiceNameByServiceClass(microservice, StartupCheckService);
        // noinspection AssignmentToFunctionParameterJS
        serviceFunctionName = serviceName + '.' + 'isMicroserviceStarted';
      } else {
        resp.writeHead(HttpStatusCodes.SUCCESS);
        resp.end();
        return;
      }
    }

    if (!microservice[serviceName]) {
      throw createBackkErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.UNKNOWN_SERVICE,
        message: BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
      });
    }

    const serviceFunctionResponseValueTypeName =
      microservice[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];

    if (!microservice[serviceName][functionName] || !serviceFunctionResponseValueTypeName) {
      throw createBackkErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION,
        message: BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION.message + serviceFunctionName
      });
    }

    const serviceFunctionArgumentTypeName =
      microservice[`${serviceName}__BackkTypes__`].functionNameToParamTypeNameMap[functionName];

    if (
      typeof serviceFunctionArgument !== 'object' ||
      Array.isArray(serviceFunctionArgument) ||
      (serviceFunctionArgumentTypeName && serviceFunctionArgument === null)
    ) {
      throw createBackkErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.INVALID_ARGUMENT,
        message: BACKK_ERRORS.INVALID_ARGUMENT.message + 'argument must be a JSON object'
      });
    }

    if (serviceFunctionArgument?.captchaToken) {
      await tryVerifyCaptchaToken(microservice, serviceFunctionArgument.captchaToken);
    }

    const userService = getMicroserviceServiceByServiceClass(microservice, UserAccountBaseService);
    const authorizationService = getMicroserviceServiceByServiceClass(microservice, AuthorizationService);
    const authHeader = headers.authorization;

    // TODO audit logging enabled by a decorator for service function
    subject = await tryAuthorize(
      microservice[serviceName],
      functionName,
      serviceFunctionArgument,
      authHeader,
      authorizationService,
      userService,
      isClusterInternalCall
    );

    const ServiceClass = microservice[serviceName].constructor;
    const dataStore = (microservice[serviceName] as BaseService).getDataStore();

    if ((serviceFunctionArgument.userId || serviceFunctionArgument.userAccountId) &&
      !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserDespiteOfUserIdInArg(
        ServiceClass,
        functionName
      )) {
      throw new Error(serviceName + '.' + functionName + ': argument contains userId or userAccountId and @AllowForEveryUser() annotation. Do you mean to use @AllowForEveryUserForOwnResources() annotation instead? If not, you must annotate this function with @AllowForEveryUser(true)')
    }

    let instantiatedServiceFunctionArgument: any;
    if (serviceFunctionArgumentTypeName) {
      instantiatedServiceFunctionArgument = plainToClass(
        microservice[serviceName]['Types'][serviceFunctionArgumentTypeName],
        serviceFunctionArgument
      );

      Object.entries(instantiatedServiceFunctionArgument).forEach(([propName, propValue]: [string, any]) => {
        if (Array.isArray(propValue) && propValue.length > 0) {
          instantiatedServiceFunctionArgument[propName] = propValue.map((pv) => {
            if (_.isPlainObject(pv)) {
              const serviceMetadata = microservice.servicesMetadata.find(
                (serviceMetadata: ServiceMetadata) => serviceMetadata.serviceName === serviceName
              );

              const { baseTypeName } = getTypeInfoForTypeName(
                serviceMetadata.types[serviceFunctionArgumentTypeName][propName]
              );

              return plainToClass(microservice[serviceName]['Types'][baseTypeName], pv);
            }
            return pv;
          });
        } else {
          if (_.isPlainObject(propValue)) {
            const serviceMetadata = microservice.servicesMetadata.find(
              (serviceMetadata: ServiceMetadata) => serviceMetadata.serviceName === serviceName
            );

            const { baseTypeName } = getTypeInfoForTypeName(
              serviceMetadata.types[serviceFunctionArgumentTypeName][propName]
            );

            instantiatedServiceFunctionArgument[propName] = plainToClass(
              microservice[serviceName]['Types'][baseTypeName],
              propValue
            );
          }
        }
      });

      if (!instantiatedServiceFunctionArgument) {
        throw createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT);
      }

      await tryValidateServiceFunctionArgument(
        microservice[serviceName].constructor,
        functionName,
        dataStore,
        instantiatedServiceFunctionArgument
      );
    }

    if (
      httpMethod === 'GET' &&
      getMicroserviceServiceByServiceClass(
        microservice,
        ResponseCacheConfigService
      )?.shouldCacheServiceFunctionCallResponse(serviceFunctionName, serviceFunctionArgument)
    ) {
      const key =
        'BackkResponseCache' +
        ':' +
        getNamespacedMicroserviceName() +
        ':' +
        serviceFunctionName +
        ':' +
        JSON.stringify(serviceFunctionArgument);

      const redisCacheHost =
        process.env.REDIS_CACHE_HOST ??
        throwException('REDIS_CACHE_HOST environment variable must be defined');

      const redisCachePort =
        process.env.REDIS_CACHE_PORT ??
        throwException('REDIS_CACHE_PORT environment variable must be defined');

      const password = process.env.REDIS_CACHE_PASSWORD
        ? `:${process.env.REDIS_CACHE_PASSWORD}@`
        : getDefaultOrThrowExceptionInProduction('REDIS_CACHE_PORT environment variable must be defined', '');

      const redisCacheServer = `redis://${password}${redisCacheHost}:${redisCachePort}`;
      const redis = new Redis(redisCacheServer);

      let cachedResponseJson;

      try {
        cachedResponseJson = await redis.get(key);
      } catch (error) {
        log(Severity.ERROR, 'Redis cache error: ' + error.message, error.stack, {
          redisCacheServer
        });
      }

      if (cachedResponseJson) {
        log(Severity.DEBUG, 'Redis cache debug: fetched service function call response from cache', '', {
          redisCacheServer,
          key
        });

        defaultServiceMetrics.incrementServiceFunctionCallCacheHitCounterByOne(serviceFunctionName);

        try {
          response = JSON.parse(cachedResponseJson);
        } catch {
          // No operation
        }
      }
    }

    let ttl;
    let backkError = emptyError;

    if (!response) {
      const clsNamespace = getClsNamespace('serviceFunctionExecution');

      [response, backkError] = await clsNamespace.runAndReturn(async () => {
        clsNamespace.set('authHeader', headers.authorization);
        clsNamespace.set('dbLocalTransactionCount', 0);
        clsNamespace.set('remoteServiceCallCount', 0);
        clsNamespace.set('postHookRemoteServiceCallCount', 0);
        clsNamespace.set('dataStoreOperationAfterRemoteServiceCall', false);

        // noinspection ExceptionCaughtLocallyJS
        try {
          if (dataStore) {
            await dataStore.tryReserveDbConnectionFromPool();
          }

          if (
            serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserForOwnResources(
              ServiceClass,
              functionName
            )
          ) {
            if (!userService) {
              throw new Error(
                'User account service is missing. You must implement a captcha verification service class that extends UserAccountBaseService and instantiate your class and store in a field in MicroserviceImpl class'
              );
            }

            let userAccountId;

            if (microservice[serviceName] instanceof UserAccountBaseService) {
              userAccountId = serviceFunctionArgument._id ?? subject;
              if (serviceFunctionArgument._id) {
                subjectCache.storeExpiringItem(subject, userAccountId, 30 * 60);
              } else if (subject) {
                subjectCache.removeItem(subject);
              } else {
                throw createBackkErrorFromErrorCodeMessageAndStatus(
                  BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED
                );
              }
            }

            if (userAccountId === undefined) {
              if (subjectCache.hasItem(subject)) {
                userAccountId = subjectCache.retrieveItemValue(subject);
              } else {
                const [idEntity, error] = await userService.getIdBySubject({ subject });
                throwIf(error);
                userAccountId = idEntity.data._id;
                subjectCache.storeExpiringItem(subject, userAccountId, 30 * 60);
                clsNamespace.set('dbLocalTransactionCount', 0);
              }
            }

            clsNamespace.set(
              'userAccountIdFieldName',
              serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserForOwnResources(
                ServiceClass,
                functionName
              )
            );

            clsNamespace.set('userAccountId', userAccountId.toString());
          }

          [response, backkError] = await microservice[serviceName][functionName](
            instantiatedServiceFunctionArgument
          );

          if (dataStore) {
            dataStore.tryReleaseDbConnectionBackToPool();
          }

          if (
            clsNamespace.get('dbLocalTransactionCount') > 1 &&
            clsNamespace.get('remoteServiceCallCount') === 0 &&
            !serviceFunctionAnnotationContainer.isServiceFunctionNonTransactional(
              microservice[serviceName].constructor,
              functionName
            )
          ) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(
              serviceFunctionName +
                ": multiple database manager operations must be executed inside a transaction (use database manager's executeInsideTransaction method) or service function must be annotated with @NoTransaction"
            );
          } else if (
            clsNamespace.get('dbLocalTransactionCount') >= 1 &&
            clsNamespace.get('remoteServiceCallCount') === 1 &&
            !serviceFunctionAnnotationContainer.isServiceFunctionNonTransactional(
              microservice[serviceName].constructor,
              functionName
            )
          ) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(
              serviceFunctionName +
                ': database manager operation and remote service callRemoteService must be executed inside a transaction or service function must be annotated with @NoTransaction if no transaction is needed'
            );
          } else if (
            (clsNamespace.get('remoteServiceCallCount') > 1 ||
              clsNamespace.get('postHookRemoteServiceCallCount') > 1) &&
            !serviceFunctionAnnotationContainer.isServiceFunctionNonDistributedTransactional(
              microservice[serviceName].constructor,
              functionName
            )
          ) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(
              serviceFunctionName +
                ": multiple remote service calls cannot be executed because distributed transactions are not supported. To allow multiple remote service calls that don't require a transaction, annotate service function with @NoDistributedTransactionNeeded"
            );
          } else if (
            clsNamespace.get('dataStoreOperationAfterRemoteServiceCall') &&
            !serviceFunctionAnnotationContainer.isServiceFunctionNonDistributedTransactional(
              microservice[serviceName].constructor,
              functionName
            )
          ) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(
              serviceFunctionName +
                ': database manager operation(s) that can fail cannot be called after a remote service callRemoteService that cannot be rolled back. Alternatively, service function must be annotated with @NoDistributedTransactionNeeded if no distributed transaction is needed'
            );
          }
        } catch (error) {
          backkError = createBackkErrorFromError(error);
        }

        return [response ? response : undefined, backkError];
      });

      if (backkError) {
        if (backkError.statusCode >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
          defaultServiceMetrics.incrementHttp5xxErrorsByOne();
        } else if (backkError.statusCode >= HttpStatusCodes.CLIENT_ERRORS_START) {
          defaultServiceMetrics.incrementHttpClientErrorCounter(serviceFunctionName);
        }
        // noinspection ExceptionCaughtLocallyJS
        throw backkError;
      }

      if (response) {
        const { baseTypeName: serviceFunctionBaseReturnTypeName, isOneOf, isManyOf } = getTypeInfoForTypeName(
          microservice[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName]
        );

        const ServiceFunctionReturnType =
          microservice[serviceName]['Types'][serviceFunctionBaseReturnTypeName];

        const backkError = await fetchFromRemoteServices(
          ServiceFunctionReturnType,
          instantiatedServiceFunctionArgument,
          response,
          microservice[serviceName]['Types']
        );

        if (backkError) {
          if (backkError.statusCode >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
            defaultServiceMetrics.incrementHttp5xxErrorsByOne();
          } else if (backkError.statusCode >= HttpStatusCodes.CLIENT_ERRORS_START) {
            defaultServiceMetrics.incrementHttpClientErrorCounter(serviceFunctionName);
          }
          // noinspection ExceptionCaughtLocallyJS
          throw backkError;
        }

        if (Array.isArray(response) && response.length > 0 && typeof response[0] === 'object') {
          await tryValidateServiceFunctionReturnValue(
            response[0],
            ServiceFunctionReturnType,
            serviceFunctionName
          );
        } else if (typeof response === 'object') {
          if (isManyOf) {
            await tryValidateServiceFunctionReturnValue(
              response.data[0],
              ServiceFunctionReturnType,
              serviceFunctionName
            );
          } else if (isOneOf) {
            await tryValidateServiceFunctionReturnValue(
              response.data,
              ServiceFunctionReturnType,
              serviceFunctionName
            );
          } else {
            await tryValidateServiceFunctionReturnValue(
              response,
              ServiceFunctionReturnType,
              serviceFunctionName
            );
          }
        }

        if (
          httpMethod === 'GET' &&
          getMicroserviceServiceByServiceClass(
            microservice,
            ResponseCacheConfigService
          )?.shouldCacheServiceFunctionCallResponse(serviceFunctionName, serviceFunctionArgument)
        ) {
          const redisCacheHost =
            process.env.REDIS_CACHE_HOST ??
            throwException('REDIS_CACHE_HOST environment variable must be defined');

          const redisCachePort =
            process.env.REDIS_CACHE_PORT ??
            throwException('REDIS_CACHE_PORT environment variable must be defined');

          const password = process.env.REDIS_CACHE_PASSWORD
            ? `:${process.env.REDIS_CACHE_PASSWORD}@`
            : getDefaultOrThrowExceptionInProduction(
                'REDIS_CACHE_PORT environment variable must be defined',
                ''
              );

          const redisCacheServer = `redis://${password}${redisCacheHost}:${redisCachePort}`;
          const redis = new Redis(redisCacheServer);

          const responseJson = JSON.stringify(response);
          const key =
            'BackkResponseCache' +
            ':' +
            getNamespacedMicroserviceName() +
            ':' +
            serviceFunctionName +
            ':' +
            JSON.stringify(serviceFunctionArgument);

          try {
            ttl = await redis.ttl(key);
            await redis.set(key, responseJson);

            log(Severity.DEBUG, 'Redis cache debug: stored service function call response to cache', '', {
              redisCacheServer,
              key
            });

            defaultServiceMetrics.incrementServiceFunctionCallCachedResponsesCounterByOne(serviceName);

            if (ttl < 0) {
              ttl = getMicroserviceServiceByServiceClass(
                microservice,
                ResponseCacheConfigService
              )?.getCachingDurationInSecs(serviceFunctionName, serviceFunctionArgument);

              await redis.expire(key, ttl);
            }
          } catch (error) {
            log(Severity.ERROR, 'Redis cache error message: ' + error.message, error.stack, {
              redisCacheServer
            });
          }
        }

        if (response.data?.version) {
          if (typeof resp.setHeader === 'function') {
            resp.setHeader('ETag', response.data.version);
          }

          if (response.data.version === headers['If-None-Match']) {
            response = null;
            resp.writeHead(HttpStatusCodes.NOT_MODIFIED);
          }
        }
      }
    }

    const serviceFunctionProcessingTimeInMillis = Date.now() - serviceFunctionCallStartTimeInMillis;
    defaultServiceMetrics.incrementServiceFunctionProcessingTimeInSecsBucketCounterByOne(
      serviceFunctionName,
      serviceFunctionProcessingTimeInMillis / 1000
    );

    if (ttl) {
      if (typeof resp.setHeader === 'function') {
        resp.setHeader('Cache-Control', 'max-age=' + ttl);
      } else {
        resp.setHeader('Cache-Control', 'no-store');
      }
    }

    if (typeof resp.setHeader === 'function') {
      resp.setHeader('X-content-type-options', 'nosniff');
      resp.setHeader('Strict-Transport-Security', 'max-age=' + MAX_INT_VALUE + '; includeSubDomains');
      resp.setHeader('X-Frame-Options', 'DENY');
      resp.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    }

    Object.entries(
      serviceFunctionAnnotationContainer.getResponseHeadersForServiceFunction(
        microservice[serviceName].constructor,
        functionName
      ) || {}
    ).forEach(([headerName, headerValueOrGenerator]) => {
      if (typeof headerValueOrGenerator === 'string') {
        if (typeof resp.setHeader === 'function') {
          resp.setHeader(headerName, headerValueOrGenerator);
        }
      } else if (typeof headerValueOrGenerator === 'function') {
        const headerValue = headerValueOrGenerator(serviceFunctionArgument, response);
        if (headerValue !== undefined) {
          if (typeof resp.setHeader === 'function') {
            resp.setHeader(headerName, headerValue);
          }
        }
      }
    });

    const responseStatusCode = serviceFunctionAnnotationContainer.getResponseStatusCodeForServiceFunction(
      microservice[serviceName].constructor,
      functionName
    );

    resp.writeHead(
      responseStatusCode && process.env.NODE_ENV !== 'development'
        ? responseStatusCode
        : HttpStatusCodes.SUCCESS,
      { 'Content-Type': 'application/json' }
    );

    resp.end(JSON.stringify(response));
  } catch (errorOrBackkError) {
    storedError = errorOrBackkError;
    if (isBackkError(errorOrBackkError)) {
      resp.writeHead((errorOrBackkError as BackkError).statusCode, { 'Content-Type': 'application/json' });
      resp.end(JSON.stringify(errorOrBackkError));
    } else {
      resp.writeHead(HttpStatusCodes.INTERNAL_SERVER_ERROR, { 'Content-Type': 'application/json' });
      resp.end(JSON.stringify(createBackkErrorFromError(errorOrBackkError)));
    }
  } finally {
    if (microservice[serviceName] instanceof UserAccountBaseService || subject) {
      const auditLogEntry = createAuditLogEntry(
        subject ?? serviceFunctionArgument?.subject ?? '',
        (headers['x-forwarded-for'] ?? '') as string,
        (headers.authorization ?? '') as string,
        microservice[serviceName] instanceof UserAccountBaseService ? functionName : serviceFunctionName,
        storedError ? 'failure' : 'success',
        storedError?.statusCode,
        storedError?.message,
        microservice[serviceName] instanceof UserAccountBaseService
          ? serviceFunctionArgument
          : { _id: response?._id }
      );
      await getMicroserviceServiceByServiceClass(microservice, AuditLoggingService)?.log(auditLogEntry);
    }
  }
}
