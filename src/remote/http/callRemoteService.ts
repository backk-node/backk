import { getNamespace } from 'cls-hooked';
import { context, fetch } from 'fetch-h2';
import fs from 'fs';
import { KeyObject } from 'tls';
import { HttpStatusCodes } from '../../constants/constants';
import createBackkErrorFromError from '../../errors/createBackkErrorFromError';
import log, { Severity } from '../../observability/logging/log';
import defaultServiceMetrics from '../../observability/metrics/defaultServiceMetrics';
import { backkErrorSymbol } from '../../types/BackkError';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import parseRemoteServiceFunctionCallUrlParts from '../utils/parseRemoteServiceFunctionCallUrlParts';
import {
  remoteMicroserviceNameToControllerMap,
  validateServiceFunctionArguments,
} from '../utils/validateServiceFunctionArguments';
import getRemoteResponseTestValue from './getRemoteResponseTestValue';

export interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  httpVersion?: 1 | 2;
  tls?: {
    ca?: string | Buffer | Array<string | Buffer>;
    cert?: string | Buffer | Array<string | Buffer>;
    key?: string | Buffer | Array<Buffer | KeyObject>;
  };
}

// noinspection FunctionTooLongJS
export default async function callRemoteService(
  microserviceName: string,
  serviceFunctionName: string,
  serviceFunctionArgument?: object,
  microserviceNamespace = process.env.MICROSERVICE_NAMESPACE,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null> {
  const server = `${microserviceName}.${microserviceNamespace}.svc.cluster.local`;
  const scheme = options?.tls ? 'https' : options?.httpVersion === 2 ? 'http2' : 'http';
  const remoteServiceFunctionUrl = `${scheme}://${server}/${serviceFunctionName}`;
  const clsNamespace = getNamespace('serviceFunctionExecution');
  clsNamespace?.set('remoteServiceCallCount', clsNamespace?.get('remoteServiceCallCount') + 1);

  log(Severity.DEBUG, 'Call sync remote service', '', { remoteServiceFunctionUrl });
  defaultServiceMetrics.incrementRemoteServiceCallCountByOne(remoteServiceFunctionUrl);

  if (process.env.NODE_ENV === 'development') {
    await validateServiceFunctionArguments([
      {
        serviceFunctionUrl: remoteServiceFunctionUrl,
        serviceFunctionArgument: serviceFunctionArgument,
      },
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
    const response = await fetchOrContextFetch(remoteServiceFunctionUrl, {
      method: (options?.httpMethod?.toUpperCase() as any) ?? 'POST',
      body: serviceFunctionArgument ? JSON.stringify(serviceFunctionArgument) : undefined,
      headers: {
        ...(serviceFunctionArgument ? { 'Content-Type': 'application/json' } : {}),
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
          remoteServiceFunctionCallUrl: remoteServiceFunctionUrl,
        });

        defaultServiceMetrics.incrementSyncRemoteServiceHttp5xxErrorResponseCounter(remoteServiceFunctionUrl);
      } else {
        log(Severity.DEBUG, message, stackTrace, {
          errorCode,
          statusCode: response.status,
          remoteServiceFunctionCallUrl: remoteServiceFunctionUrl,
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
          statusCode: response.status,
        },
      ];
    }

    return [responseBody, null];
  } catch (error) {
    log(Severity.ERROR, error.message, error.stack, {
      remoteServiceFunctionCallUrl: remoteServiceFunctionUrl,
    });

    defaultServiceMetrics.incrementRemoteServiceCallErrorCountByOne(remoteServiceFunctionUrl);
    return [null, createBackkErrorFromError(error)];
  }
}
