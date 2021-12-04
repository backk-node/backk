import { plainToClass } from 'class-transformer';
import Redis from 'ioredis';
import { MemoryCache } from 'memory-cache-node';
import AuthorizationService from '../authorization/AuthorizationService';
import tryAuthorize from '../authorization/tryAuthorize';
import ResponseCacheConfigService from '../cache/ResponseCacheConfigService';
import tryVerifyCaptchaToken from '../captcha/tryVerifyCaptchaToken';
import { Durations, HttpStatusCodes, Values } from '../constants/constants';
import getClsNamespace from '../continuationlocalstorage/getClsNamespace';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import { backkErrors } from '../errors/backkErrors';
import createBackkErrorFromError from '../errors/createBackkErrorFromError';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import createErrorFromErrorCodeMessageAndStatus from '../errors/createErrorFromErrorCodeMessageAndStatus';
import emptyError from '../errors/emptyError';
import isBackkError from '../errors/isBackkError';
import getMicroserviceServiceByServiceClass from '../microservice/getMicroserviceServiceByServiceClass';
import getMicroserviceServiceNameByServiceClass from '../microservice/getMicroserviceServiceNameByServiceClass';
import {
  generateInternalServicesMetadata,
  generatePublicServicesMetadata,
} from '../microservice/initializeMicroservice';
import AuditLoggingService from '../observability/logging/audit/AuditLoggingService';
import createAuditLogEntry from '../observability/logging/audit/createAuditLogEntry';
import log, { Severity } from '../observability/logging/log';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import { getOpenApiSpec } from '../openapi/writeOpenApiSpecFile';
import tryScheduleJobExecution from '../scheduling/tryScheduleJobExecution';
import BaseService from '../services/BaseService';
import LivenessCheckService from '../services/LivenessCheckService';
import ReadinessCheckService from '../services/ReadinessCheckService';
import StartupCheckService from '../services/startup/StartupCheckService';
import TenantBaseService from '../services/tenant/TenantBaseService';
import UserBaseService from '../services/useraccount/UserBaseService';
import { BackkError } from '../types/BackkError';
import { getDefaultOrThrowExceptionInProduction } from '../utils/exception/getDefaultOrThrowExceptionInProduction';
import throwException from '../utils/exception/throwException';
import throwIf from '../utils/exception/throwIf';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import tryValidateServiceFunctionArgument from '../validation/tryValidateServiceFunctionArgument';
import tryValidateServiceFunctionReturnValue from '../validation/tryValidateServiceFunctionReturnValue';
import executeMultipleServiceFunctions from './executeMultipleServiceFunctions';
import fetchFromRemoteServices from './fetchFromRemoteServices';
import isExecuteMultipleRequest from './isExecuteMultipleRequest';

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

const subjectToUserAccountIdCache = new MemoryCache<string, string>(
  5 * Durations.SECS_IN_MINUTE,
  Values._100K
);
const issuerToTenantIdCache = new MemoryCache<string, string>(5 * Durations.SECS_IN_MINUTE, Values._10K);

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
  let issuer: string | undefined;
  let response: any;
  // eslint-disable-next-line prefer-const
  let [serviceName, functionName] = serviceFunctionName.split('.');
  const ServiceClass = microservice[serviceName]?.constructor;

  if (
    typeof ServiceClass === 'function' &&
    serviceFunctionAnnotationContainer.isSubscription(ServiceClass, functionName) &&
    typeof resp.setHeader === 'function'
  ) {
    resp.setHeader('Connection', 'keep-alive');
  }

  try {
    if (httpMethod !== 'GET' && httpMethod !== 'POST') {
      throw createBackkErrorFromErrorCodeMessageAndStatus(backkErrors.INVALID_HTTP_METHOD);
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
            ...backkErrors.INVALID_ARGUMENT,
            message: backkErrors.INVALID_ARGUMENT.message + 'too many service functions called',
          });
        }
      } else {
        throw new Error('Missing maxServiceFunctionCountInMultipleServiceFunctionExecution option');
      }

      if (serviceFunctionName === 'executeMultipleServiceFunctionsInParallelWithoutTransaction') {
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
      } else if (serviceFunctionName === 'executeMultipleServiceFunctionsInSequenceWithoutTransaction') {
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
      } else if (serviceFunctionName === 'executeMultipleServiceFunctionsInParallelInsideTransaction') {
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
      } else if (serviceFunctionName === 'executeMultipleServiceFunctionsInSequenceInsideTransaction') {
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

    if (serviceFunctionName === 'scheduleServiceFunctionExecution') {
      return await tryScheduleJobExecution(microservice, serviceFunctionArgument, headers, resp);
    }

    if (httpMethod === 'GET') {
      if (
        (!serviceFunctionName.match(
          options?.httpGetRequests?.regExpForAllowedServiceFunctionNames ?? /^[a-z][A-Za-z0-9]*\.get/
        ) ||
          options?.httpGetRequests?.deniedServiceFunctionNames?.includes(serviceFunctionName)) &&
        !serviceFunctionAnnotationContainer.doesServiceFunctionAllowHttpGetMethod(ServiceClass, functionName)
      ) {
        throw createErrorFromErrorCodeMessageAndStatus(backkErrors.HTTP_METHOD_MUST_BE_POST);
      }

      // noinspection AssignmentToFunctionParameterJS
      serviceFunctionArgument = decodeURIComponent(serviceFunctionArgument);

      try {
        // noinspection AssignmentToFunctionParameterJS
        serviceFunctionArgument = JSON.parse(serviceFunctionArgument);
      } catch (error) {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...backkErrors.INVALID_ARGUMENT,
          message:
            backkErrors.INVALID_ARGUMENT.message +
            'argument not valid or too long. Argument must be a URI encoded JSON string',
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
          ...backkErrors.UNKNOWN_SERVICE,
          message: backkErrors.UNKNOWN_SERVICE.message + serviceName,
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
            commonErrors: backkErrors,
          })
        );
        return;
      } else {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...backkErrors.UNKNOWN_SERVICE,
          message: backkErrors.UNKNOWN_SERVICE.message + serviceName,
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
        ...backkErrors.UNKNOWN_SERVICE,
        message: backkErrors.UNKNOWN_SERVICE.message + serviceName,
      });
    }

    const serviceFunctionResponseValueTypeName =
      microservice[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];

    if (!microservice[serviceName][functionName] || !serviceFunctionResponseValueTypeName) {
      throw createBackkErrorFromErrorCodeMessageAndStatus({
        ...backkErrors.UNKNOWN_SERVICE_FUNCTION,
        message: backkErrors.UNKNOWN_SERVICE_FUNCTION.message + serviceFunctionName,
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
        ...backkErrors.INVALID_ARGUMENT,
        message: backkErrors.INVALID_ARGUMENT.message + 'argument must be a JSON object',
      });
    }

    if (serviceFunctionArgument?.captchaToken) {
      await tryVerifyCaptchaToken(microservice, serviceFunctionArgument.captchaToken);
    }

    const userService = getMicroserviceServiceByServiceClass(microservice, UserBaseService);
    const authorizationService = getMicroserviceServiceByServiceClass(microservice, AuthorizationService);
    const authHeader = headers.authorization;

    [subject, issuer] = await tryAuthorize(
      microservice[serviceName],
      functionName,
      serviceFunctionArgument,
      authHeader,
      authorizationService,
      userService,
      isClusterInternalCall
    );

    const dataStore = (microservice[serviceName] as BaseService).getDataStore();

    if (
      (serviceFunctionArgument?.userId ||
        serviceFunctionArgument?.userAccountId ||
        serviceFunctionArgument?.tenantId ||
        (serviceFunctionArgument?.subject && microservice[serviceName] instanceof UserBaseService)) &&
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserDespiteOfUserIdInArg(
        ServiceClass,
        functionName
      ) === false
    ) {
      throw new Error(
        serviceName +
          '.' +
          functionName +
          ": argument contains 'tenantId', subject', 'userId' or 'userAccountId' and @AllowForEveryUser() annotation. Do you mean to use @AllowForEveryUserForOwnResources() annotation instead? If not, you must annotate this function with AllowForEveryUser decorator including a true flag: @AllowForEveryUser(true)"
      );
    }

    let instantiatedServiceFunctionArgument: any;
    if (serviceFunctionArgumentTypeName) {
      instantiatedServiceFunctionArgument = plainToClass(
        microservice[serviceName]['Types'][serviceFunctionArgumentTypeName],
        serviceFunctionArgument
      );

      if (!instantiatedServiceFunctionArgument) {
        throw createBackkErrorFromErrorCodeMessageAndStatus(backkErrors.MISSING_SERVICE_FUNCTION_ARGUMENT);
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
          redisCacheServer,
        });
      }

      if (cachedResponseJson) {
        log(Severity.DEBUG, 'Redis cache debug: fetched service function call response from cache', '', {
          redisCacheServer,
          key,
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
            let userAccountOrTenantId;

            if (microservice[serviceName] instanceof UserBaseService) {
              userAccountOrTenantId = serviceFunctionArgument._id ?? subject;
              if (serviceFunctionArgument._id && subject) {
                subjectToUserAccountIdCache.storeExpiringItem(
                  subject,
                  userAccountOrTenantId,
                  30 * Durations.SECS_IN_MINUTE
                );
              } else if (subject) {
                subjectToUserAccountIdCache.removeItem(subject);
              } else {
                throw createBackkErrorFromErrorCodeMessageAndStatus(
                  backkErrors.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED
                );
              }
            } else if (microservice[serviceName] instanceof TenantBaseService) {
              userAccountOrTenantId = serviceFunctionArgument._id ?? issuer;
              if (serviceFunctionArgument._id && issuer) {
                issuerToTenantIdCache.storeExpiringItem(
                  issuer,
                  userAccountOrTenantId,
                  30 * Durations.SECS_IN_MINUTE
                );
              } else if (issuer) {
                issuerToTenantIdCache.removeItem(issuer);
              } else {
                throw createBackkErrorFromErrorCodeMessageAndStatus(
                  backkErrors.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED
                );
              }
            }

            if (
              userAccountOrTenantId === undefined &&
              subject &&
              serviceFunctionArgument?.tenantId === undefined
            ) {
              if (subjectToUserAccountIdCache.hasItem(subject)) {
                userAccountOrTenantId = subjectToUserAccountIdCache.retrieveItemValue(subject);
              } else {
                if (!userService) {
                  throw new Error(
                    'User account service is missing. You must implement a user account service class that extends UserBaseService class and instantiate your class and store in a field in MicroserviceImpl class'
                  );
                }
                const [idEntity, error] = await userService.getIdBySubject({ subject });
                throwIf(error);
                userAccountOrTenantId = idEntity.data._id;
                subjectToUserAccountIdCache.storeExpiringItem(
                  subject,
                  userAccountOrTenantId,
                  30 * Durations.SECS_IN_MINUTE
                );
                clsNamespace.set('dbLocalTransactionCount', 0);
              }
            } else if (
              userAccountOrTenantId === undefined &&
              issuer &&
              serviceFunctionArgument?.tenantId !== undefined
            ) {
              if (issuerToTenantIdCache.hasItem(issuer)) {
                userAccountOrTenantId = issuerToTenantIdCache.retrieveItemValue(issuer);
              } else {
                const tenantService = getMicroserviceServiceByServiceClass(microservice, TenantBaseService);
                if (!tenantService) {
                  throw new Error(
                    'Tenant service is missing. You must implement a tenant service class that extends TenantBaseService and instantiate your class and store in a field in MicroserviceImpl class'
                  );
                }
                const [idEntity, error] = await tenantService.getIdByIssuer({ issuer });
                throwIf(error);
                userAccountOrTenantId = idEntity.data._id;
                issuerToTenantIdCache.storeExpiringItem(
                  issuer,
                  userAccountOrTenantId,
                  30 * Durations.SECS_IN_MINUTE
                );
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

            clsNamespace.set('userAccountId', userAccountOrTenantId.toString());
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
        const {
          baseTypeName: serviceFunctionBaseReturnTypeName,
          isOneOf,
          isManyOf,
        } = getTypeInfoForTypeName(
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
            if (response.data.length > 0) {
              await tryValidateServiceFunctionReturnValue(
                response.data[0],
                ServiceFunctionReturnType,
                serviceFunctionName
              );
            }
          } else if (isOneOf) {
            if (response.data !== undefined) {
              await tryValidateServiceFunctionReturnValue(
                response.data,
                ServiceFunctionReturnType,
                serviceFunctionName
              );
            }
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
              key,
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
              redisCacheServer,
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
      }
    } else {
      if (typeof resp.setHeader === 'function') {
        resp.setHeader('Cache-Control', 'no-store');
      }
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
      {
        'Content-Type':
          typeof ServiceClass === 'function' &&
          serviceFunctionAnnotationContainer.isSubscription(ServiceClass, functionName)
            ? 'text/event-stream'
            : 'application/json',
      }
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
    const auditLog = ServiceClass
      ? serviceFunctionAnnotationContainer.getAuditLog(ServiceClass, functionName)
      : undefined;

    if (
      microservice[serviceName] instanceof UserBaseService ||
      auditLog?.shouldLog(serviceFunctionArgument, response)
    ) {
      const auditLogEntry = createAuditLogEntry(
        subject ?? serviceFunctionArgument?.subject ?? '',
        (headers['x-forwarded-for'] ?? '') as string,
        (headers.authorization ?? '') as string,
        microservice[serviceName] instanceof UserBaseService ? functionName : serviceFunctionName,
        storedError ? 'failure' : 'success',
        storedError?.statusCode,
        storedError?.message,
        microservice[serviceName] instanceof UserBaseService
          ? serviceFunctionArgument
          : { ...(auditLog?.attributesToLog(serviceFunctionArgument, response) ?? {}), _id: response?._id }
      );
      await getMicroserviceServiceByServiceClass(microservice, AuditLoggingService)?.log(auditLogEntry);
    }
  }
}
