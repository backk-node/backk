import { HttpRequestOptions } from "./callRemoteService";
import fetch from "node-fetch";
import { HttpStatusCodes } from "../../constants/constants";
import log, { Severity } from "../../observability/logging/log";
import defaultServiceMetrics from "../../observability/metrics/defaultServiceMetrics";
import { backkErrorSymbol } from "../../types/BackkError";
import createBackkErrorFromError from "../../errors/createBackkErrorFromError";
import { getNamespace } from "cls-hooked";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";

export default async function makeHttpRequest(
  requestUrl: string,
  requestBodyObject?: object,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null> {
  const clsNamespace = getNamespace('serviceFunctionExecution');
  clsNamespace?.set('remoteServiceCallCount', clsNamespace?.get('remoteServiceCallCount') + 1);
  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');

  try {
    const response = await fetch(requestUrl, {
      method: options?.httpMethod?.toLowerCase() ?? 'get',
      body: requestBodyObject ? JSON.stringify(requestBodyObject) : undefined,
      headers: {
        ...(requestBodyObject ? { 'Content-Type': 'application/json' } : {}),
        Authorization: authHeader
      }
    });

    const responseBody: any = response.size > 0 ? await response.json() : undefined;

    if (response.status >= HttpStatusCodes.ERRORS_START) {
      const message = responseBody.message ?? JSON.stringify(responseBody);
      const stackTrace = responseBody.stackTrace ?? undefined;
      const errorCode = responseBody.errorCode ?? undefined;

      if (response.status >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
        log(Severity.ERROR, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          requestUrl
        });

        defaultServiceMetrics.incrementSyncRemoteServiceHttp5xxErrorResponseCounter(requestUrl);
      } else {
        log(Severity.DEBUG, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          requestUrl
        });

        if (response.status === HttpStatusCodes.FORBIDDEN) {
          defaultServiceMetrics.incrementSyncRemoteServiceCallAuthFailureCounter(requestUrl);
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
      requestUrl
    });

    defaultServiceMetrics.incrementRemoteServiceCallErrorCountByOne(requestUrl);
    return [null, createBackkErrorFromError(error)];
  }
}
