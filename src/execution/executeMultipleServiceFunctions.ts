import Mustache from 'mustache';
import tryExecuteServiceMethod, { ServiceFunctionExecutionOptions } from './tryExecuteServiceMethod';
import forEachAsyncParallel from '../utils/forEachAsyncParallel';
import { ServiceFunctionCall } from './ServiceFunctionCall';
import { ServiceFunctionCallResponse } from './ServiceFunctionCallResponse';
import BackkResponse from './BackkResponse';
import forEachAsyncSequential from '../utils/forEachAsyncSequential';
import BaseService from '../services/BaseService';
import isValidServiceFunctionName from './isValidServiceFunctionName';
import { HttpStatusCodes } from '../constants/constants';
import { BackkError } from '../types/BackkError';
import callRemoteService from '../remote/http/callRemoteService';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import createErrorFromErrorCodeMessageAndStatus from '../errors/createErrorFromErrorCodeMessageAndStatus';
import { backkErrors } from '../errors/backkErrors';
import getClsNamespace from '../continuationlocalstorage/getClsNamespace';
import getMicroserviceName from "../utils/getMicroserviceName";

async function executeMultiple<T>(
  isConcurrent: boolean,
  serviceFunctionArgument: object,
  controller: any,
  headers: { [key: string]: string | string[] | undefined },
  isClusterInternalCall: boolean,
  options: ServiceFunctionExecutionOptions | undefined,
  serviceFunctionCallIdToResponseMap: { [p: string]: ServiceFunctionCallResponse },
  statusCodes: number[],
  isTransactional = false
) {
  const forEachFunc = isConcurrent ? forEachAsyncParallel : forEachAsyncSequential;
  let possibleErrorResponse: BackkError | null = null;

  await forEachFunc(
    Object.entries(serviceFunctionArgument),
    async ([
      serviceFunctionCallId,
      { microserviceName, microserviceNamespace, serviceFunctionName, serviceFunctionArgument }
    ]: [string, ServiceFunctionCall]) => {
      if (possibleErrorResponse) {
        return;
      }

      const response = new BackkResponse();

      let renderedServiceFunctionArgument = serviceFunctionArgument;
      if ((options?.multipleServiceFunctionExecution?.shouldAllowTemplates && !isConcurrent) ?? false) {
        renderedServiceFunctionArgument = Mustache.render(
          JSON.stringify(serviceFunctionArgument),
          serviceFunctionCallIdToResponseMap
        );

        renderedServiceFunctionArgument = JSON.parse(renderedServiceFunctionArgument);
      }

      if (microserviceName && microserviceName !== getMicroserviceName()) {
        if (isTransactional) {
          response.end(
            createBackkErrorFromErrorCodeMessageAndStatus(
              backkErrors.REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED_INSIDE_TRANSACTION
            )
          );

          response.writeHead(HttpStatusCodes.BAD_REQUEST);
        } else if (!options?.multipleServiceFunctionExecution?.regExpForAllowedRemoteServiceFunctionCalls) {
          response.end(
            createBackkErrorFromErrorCodeMessageAndStatus(
              backkErrors.ALLOWED_REMOTE_SERVICE_FUNCTIONS_REGEXP_PATTERN_NOT_DEFINED
            )
          );

          response.writeHead(HttpStatusCodes.BAD_REQUEST);
        } else if (
          !serviceFunctionName.match(
            options?.multipleServiceFunctionExecution?.regExpForAllowedRemoteServiceFunctionCalls
          )
        ) {
          response.end(
            createBackkErrorFromErrorCodeMessageAndStatus(
              backkErrors.REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED
            )
          );

          response.writeHead(HttpStatusCodes.BAD_REQUEST);
        } else {
          const [remoteResponse, error] = await callRemoteService(
            microserviceName,
            serviceFunctionName,
            serviceFunctionArgument,
            microserviceNamespace
          );

          response.end(remoteResponse);
          response.writeHead(error ? error.statusCode : HttpStatusCodes.SUCCESS);
        }
      } else {
        await tryExecuteServiceMethod(
          controller,
          serviceFunctionName,
          renderedServiceFunctionArgument,
          headers,
          'POST',
          response,
          isClusterInternalCall,
          options
        );
      }

      serviceFunctionCallIdToResponseMap[serviceFunctionCallId] = {
        statusCode: response.getStatusCode(),
        response: response.getResponse()
      };

      if (response.getErrorResponse()) {
        possibleErrorResponse = response.getErrorResponse();
      }

      statusCodes.push(response.getStatusCode());
    }
  );
}

export default async function executeMultipleServiceFunctions(
  isConcurrent: boolean,
  shouldExecuteInsideTransaction: boolean,
  controller: any,
  serviceFunctionCalls: object,
  headers: { [key: string]: string | string[] | undefined },
  resp: any,
  isClusterInternalCall: boolean,
  options?: ServiceFunctionExecutionOptions
): Promise<void | object> {
  const areServiceFunctionCallsValid = Object.values(serviceFunctionCalls).reduce(
    (areCallsValid, serviceFunctionCall) =>
      areCallsValid &&
      typeof serviceFunctionCall.serviceFunctionName === 'string' &&
      isValidServiceFunctionName(serviceFunctionCall.serviceFunctionName, controller) &&
      (serviceFunctionCall.serviceFunctionArgument === undefined ||
        typeof serviceFunctionCall.serviceFunctionArgument === 'object') &&
      !Array.isArray(serviceFunctionCall.serviceFunctionArgument),
    true
  );

  if (!areServiceFunctionCallsValid) {
    throw createErrorFromErrorCodeMessageAndStatus({
      ...backkErrors.INVALID_ARGUMENT,
      message:
        backkErrors.INVALID_ARGUMENT.message + 'unknown service(s) or function(s) or invalid argument(s)'
    });
  }

  const serviceFunctionCallIdToResponseMap: { [key: string]: ServiceFunctionCallResponse } = {};
  const statusCodes: number[] = [];
  const services = Object.values(controller).filter((service) => service instanceof BaseService);
  const dataStore = (services as BaseService[])[0].getDataStore();

  const clsNamespace = getClsNamespace('multipleServiceFunctionExecutions');
  const clsNamespace2 = getClsNamespace('serviceFunctionExecution');
  await clsNamespace.runAndReturn(async () => {
    await clsNamespace2.runAndReturn(async () => {
      await dataStore.tryReserveDbConnectionFromPool();
      clsNamespace.set('connection', true);

      if (shouldExecuteInsideTransaction) {
        await dataStore.executeInsideTransaction(async () => {
          clsNamespace.set('globalTransaction', true);

          await executeMultiple(
            isConcurrent,
            serviceFunctionCalls,
            controller,
            headers,
            isClusterInternalCall,
            options,
            serviceFunctionCallIdToResponseMap,
            statusCodes,
            true
          );

          clsNamespace.set('globalTransaction', false);
          return [null, null];
        });
      } else {
        clsNamespace.set('globalTransaction', true);

        await executeMultiple(
          isConcurrent,
          serviceFunctionCalls,
          controller,
          headers,
          isClusterInternalCall,
          options,
          serviceFunctionCallIdToResponseMap,
          statusCodes
        );

        clsNamespace.set('globalTransaction', false);
      }

      dataStore.tryReleaseDbConnectionBackToPool();
      clsNamespace.set('connection', false);
    });
  });

  resp.status(Math.max(...statusCodes));
  resp.send(serviceFunctionCallIdToResponseMap);
}
