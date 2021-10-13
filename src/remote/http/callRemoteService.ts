import fetch from "node-fetch";
import log, { Severity } from "../../observability/logging/log";
import createBackkErrorFromError from "../../errors/createBackkErrorFromError";
import getRemoteResponseTestValue from "./getRemoteResponseTestValue";
import { getNamespace } from "cls-hooked";
import defaultServiceMetrics from "../../observability/metrics/defaultServiceMetrics";
import { HttpStatusCodes } from "../../constants/constants";
import {
  remoteMicroserviceNameToControllerMap,
  validateServiceFunctionArguments
} from "../utils/validateServiceFunctionArguments";
import parseRemoteServiceFunctionCallUrlParts from "../utils/parseRemoteServiceFunctionCallUrlParts";
import fs from "fs";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import { backkErrorSymbol } from "../../types/BackkError";

export interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

// noinspection FunctionTooLongJS
export default async function callRemoteService(
  remoteMicroserviceName: string,
  remoteServiceFunctionName: string,
  remoteServiceFunctionArgument?: object,
  remoteMicroserviceNamespace = process.env.SERVICE_NAMESPACE,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null> {
  const server = `${remoteMicroserviceName}.${remoteMicroserviceNamespace}.svc.cluster.local`
  const remoteServiceFunctionUrl = `http://${server}/${remoteServiceFunctionName}`;
  const clsNamespace = getNamespace('serviceFunctionExecution');
  clsNamespace?.set('remoteServiceCallCount', clsNamespace?.get('remoteServiceCallCount') + 1);

  log(Severity.DEBUG, 'Call sync remote service', '', { remoteServiceFunctionUrl });
  defaultServiceMetrics.incrementRemoteServiceCallCountByOne(remoteServiceFunctionUrl);

  if (process.env.NODE_ENV === 'development') {
    await validateServiceFunctionArguments([
      {
        remoteServiceFunctionUrl,
        remoteServiceFunctionArgument,
      }
    ]);
    const { topic, serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts(remoteServiceFunctionUrl);

    if (fs.existsSync('../' + topic) || fs.existsSync('./' + topic)) {
      const [serviceName, functionName] = serviceFunctionName.split('.');
      const controller = remoteMicroserviceNameToControllerMap[`${topic}$/${serviceName}`];
      const responseClassName =
        controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];
      const ResponseClass = controller[serviceName].Types[responseClassName];
      return [getRemoteResponseTestValue(ResponseClass), null];
    }
  }

  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');

  try {
    const response = await fetch(remoteServiceFunctionUrl, {
      method: options?.httpMethod?.toLowerCase() ?? 'post',
      body: remoteServiceFunctionArgument ? JSON.stringify(remoteServiceFunctionArgument) : undefined,
      headers: {
        ...(remoteServiceFunctionArgument ? { 'Content-Type': 'application/json' } : {}),
        Authorization: authHeader
      }
    });

    const responseBody = response.size > 0 ? await response.json() : undefined;

    if (response.status >= HttpStatusCodes.ERRORS_START) {
      const message = responseBody.message ?? JSON.stringify(responseBody);
      const stackTrace = responseBody.stackTrace ?? undefined;
      const errorCode = responseBody.errorCode ?? undefined;

      if (response.status >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
        log(Severity.ERROR, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          remoteServiceFunctionCallUrl: remoteServiceFunctionUrl
        });

        defaultServiceMetrics.incrementSyncRemoteServiceHttp5xxErrorResponseCounter(remoteServiceFunctionUrl);
      } else {
        log(Severity.DEBUG, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          remoteServiceFunctionCallUrl: remoteServiceFunctionUrl
        });

        if (response.status === HttpStatusCodes.FORBIDDEN) {
          defaultServiceMetrics.incrementSyncRemoteServiceCallAuthFailureCounter(remoteServiceFunctionUrl);
        }
      }

      return [
        null,
        {
          errorCode,
          message,
          stackTrace,
          [backkErrorSymbol]: true,
          statusCode: response.status
        }
      ];
    }

    return [responseBody, null];
  } catch (error) {
    log(Severity.ERROR, error.message, error.stack, {
      remoteServiceFunctionCallUrl: remoteServiceFunctionUrl
    });

    defaultServiceMetrics.incrementRemoteServiceCallErrorCountByOne(remoteServiceFunctionUrl);
    return [null, createBackkErrorFromError(error)];
  }
}
