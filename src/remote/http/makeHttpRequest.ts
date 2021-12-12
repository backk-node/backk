import { getNamespace } from 'cls-hooked';
import { context, fetch } from 'fetch-h2';
import { HttpStatusCodes } from '../../constants/constants';
import createBackkErrorFromError from '../../errors/createBackkErrorFromError';
import log, { Severity } from '../../observability/logging/log';
import defaultServiceMetrics from '../../observability/metrics/defaultServiceMetrics';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { HttpRequestOptions } from './callRemoteService';

export default async function makeHttpRequest(
  requestUrl: string,
  requestBodyObject?: object,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null> {
  const clsNamespace = getNamespace('serviceFunctionExecution');
  clsNamespace?.set('remoteServiceCallCount', clsNamespace?.get('remoteServiceCallCount') + 1);
  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');

  let fetchOrContextFetch = fetch;
  if (options?.tls) {
    const fetchContext = context({
      session: {
        ca: options.tls.ca,
        cert: options.tls.cert,
        key: options.tls.key,
      },
    });
    fetchOrContextFetch = fetchContext.fetch;
  }

  try {
    const response = await fetchOrContextFetch(requestUrl, {
      method: (options?.httpMethod?.toUpperCase() as any) ?? 'GET',
      body: requestBodyObject ? JSON.stringify(requestBodyObject) : undefined,
      headers: {
        ...(requestBodyObject ? { 'Content-Type': 'application/json' } : {}),
        Authorization: authHeader,
      },
    });

    const responseBody: any = await response.json();

    if (response.status >= HttpStatusCodes.ERRORS_START) {
      const message = responseBody.message ?? JSON.stringify(responseBody);
      const stackTrace = responseBody.stackTrace ?? undefined;
      const errorCode = responseBody.errorCode ?? undefined;

      if (response.status >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
        log(Severity.ERROR, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          requestUrl,
        });

        defaultServiceMetrics.incrementSyncRemoteServiceHttp5xxErrorResponseCounter(requestUrl);
      } else {
        log(Severity.DEBUG, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          requestUrl,
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
          statusCode: response.status,
        },
      ];
    }

    return [responseBody, null];
  } catch (error) {
    log(Severity.ERROR, error.message, error.stack, {
      requestUrl,
    });

    defaultServiceMetrics.incrementRemoteServiceCallErrorCountByOne(requestUrl);
    return [null, createBackkErrorFromError(error)];
  }
}
