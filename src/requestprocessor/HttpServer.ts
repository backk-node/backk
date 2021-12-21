// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import yj from "yieldable-json";
import { createServer } from "http";
import http2 from "http2";
import { promisify } from "util";
import { HttpStatusCodes, MAX_INT_VALUE } from "../constants/constants";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
import { BACKK_ERRORS } from "../errors/BACKK_ERRORS";
import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import tryExecuteServiceMethod, {
  ServiceFunctionExecutionOptions
} from "../execution/tryExecuteServiceMethod";
import Microservice from "../microservice/Microservice";
import log, { Severity } from "../observability/logging/log";
import { CommunicationMethod } from "../remote/messagequeue/sendToRemoteService";
import subscriptionManager from "../subscription/subscriptionManager";
import throwException from "../utils/exception/throwException";
import getNamespacedMicroserviceName from "../utils/getNamespacedMicroserviceName";
import Http2Response from "./Http2Response";
import { RequestProcessor } from "./RequestProcessor";

const parseJsonAsync = promisify(yj.parseAsync);

export type HttpVersion = 1 | 2;

export default class HttpServer implements RequestProcessor {
  constructor(
    private readonly httpVersion: HttpVersion = 1,
    private readonly options?: ServiceFunctionExecutionOptions
  ) {}

  startProcessingRequests(microservice: Microservice): void {
    if (this.httpVersion === 1) {
      this.startProcessingHttp1Requests(microservice);
    } else {
      this.startProcessingHttp2Requests(microservice);
    }
  }

  startProcessingHttp1Requests(microservice: Microservice): void {
    const server = createServer(async (request, response) => {
      request.setEncoding('utf8');
      const chunks: string[] = [];

      const contentLength = request.headers['content-length']
        ? parseInt(request.headers['content-length'], 10)
        : undefined;

      const MAX_REQUEST_CONTENT_LENGTH_IN_BYTES = parseInt(
        process.env.MAX_REQUEST_CONTENT_LENGTH_IN_BYTES ??
          throwException('MAX_REQUEST_CONTENT_LENGTH_IN_BYTES environment variable must be defined'),
        10
      );

      if (
        request.method === 'POST' &&
        (contentLength === undefined || contentLength > MAX_REQUEST_CONTENT_LENGTH_IN_BYTES)
      ) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.REQUEST_IS_TOO_LONG);
        response.writeHead(backkError.statusCode, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(backkError));
        return;
      }

      const isClusterInternalCall = !request.url?.includes(getNamespacedMicroserviceName());
      let serviceFunctionArgument;

      if (!isClusterInternalCall) {
        response.setHeader(
          'Access-Control-Allow-Origin',
          process.env.NODE_ENV === 'development'
            ? '*'
            : process.env.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER ?? 'https://' + process.env.API_GATEWAY_FQDN
        );
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization');
      }

      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Strict-Transport-Security', 'max-age=' + MAX_INT_VALUE + '; includeSubDomains');
      response.setHeader('X-Frame-Options', 'DENY');
      response.setHeader('Content-Security-Policy', "frame-ancestors 'none'");

      try {
        if (request.method === 'OPTIONS') {
          response.writeHead(HttpStatusCodes.SUCCESS);
          response.end();
          return;
        }
        if (request.method === 'GET') {
          const serviceFunctionArgumentInJson = request.url?.split('?arg=')[1];
          serviceFunctionArgument = serviceFunctionArgumentInJson
            ? JSON.parse(serviceFunctionArgumentInJson)
            : undefined;
        } else {
          await new Promise((resolve) => {
            request.on('data', (data) => chunks.push(data));
            request.on('end', () => resolve());
          });

          const data = chunks.join('');
          serviceFunctionArgument = data ? await parseJsonAsync(data) : null;
        }
      } catch (error) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message: BACKK_ERRORS.INVALID_ARGUMENT.message + error.message,
        });
        response.writeHead(backkError.statusCode, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(backkError));
        return;
      }

      const serviceFunctionName = request.url?.split('/').pop() ?? '';
      const [serviceName, functionName] = serviceFunctionName.split('.');
      const ServiceClass = (microservice as any)[serviceName]?.constructor;

      if (
        typeof ServiceClass === 'function' &&
        serviceFunctionAnnotationContainer.isSubscription(ServiceClass, functionName)
      ) {
        request.on('close', () => {
          subscriptionManager.removeSubscription(serviceFunctionName, response);
        });

        subscriptionManager.addSubscription(serviceFunctionName, response);
      }

      tryExecuteServiceMethod(
        microservice,
        serviceFunctionName,
        serviceFunctionArgument ?? null,
        request.headers,
        request.method ?? '',
        response,
        isClusterInternalCall,
        this.options
      );
    });

    function exit(signal: string) {
      server.close(() => {
        log(Severity.INFO, `HTTP server terminated due to signal: ${signal}`, '');
        process.exitCode = 0;
      });
    }

    process.once('SIGINT', exit);
    process.once('SIGQUIT', exit);
    process.once('SIGTERM', exit);

    process.on('uncaughtExceptionMonitor', () => {
      server.close();
    });

    const port = process.env.HTTP_SERVER_PORT ?? 3000;

    server.on('error', (error) => {
      log(Severity.ERROR, 'HTTP server error', error.message);
    });

    log(Severity.INFO, `HTTP server started, listening to port ${port}`, '');
    server.listen(port);
  }

  startProcessingHttp2Requests(microservice: Microservice): void {
    const server = http2.createServer();

    server.on('stream', async (stream, headers) => {
      stream.setEncoding('utf-8');
      const chunks: string[] = [];

      const contentLength = headers['content-length'] ? parseInt(headers['content-length'], 10) : undefined;

      const MAX_REQUEST_CONTENT_LENGTH_IN_BYTES = parseInt(
        process.env.MAX_REQUEST_CONTENT_LENGTH_IN_BYTES ??
          throwException('MAX_REQUEST_CONTENT_LENGTH_IN_BYTES environment variable must be defined'),
        10
      );

      if (
        headers[':method'] === 'POST' &&
        (contentLength === undefined || contentLength > MAX_REQUEST_CONTENT_LENGTH_IN_BYTES)
      ) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.REQUEST_IS_TOO_LONG);
        stream.respond({ ':status': backkError.statusCode, 'Content-Type': 'application/json' });
        stream.write(JSON.stringify(backkError));
        stream.end();
        return;
      }

      const isClusterInternalCall = !headers[':path']?.includes(getNamespacedMicroserviceName());
      let serviceFunctionArgument;
      let responseHeaders = {};

      if (!isClusterInternalCall) {
        responseHeaders = {
          'Access-Control-Allow-Origin':
            process.env.NODE_ENV === 'development'
              ? '*'
              : process.env.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER ?? 'https://' + process.env.API_GATEWAY_FQDN,
          'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization',
        };
      }

      responseHeaders = {
        ...responseHeaders,
        'X-Content-Type-Options': 'nosniff',
        'Strict-Transport-Security': 'max-age=' + MAX_INT_VALUE + '; includeSubDomains',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "frame-ancestors 'none'",
      };

      try {
        if (headers[':method'] === 'OPTIONS') {
          stream.respond({ ':status': HttpStatusCodes.SUCCESS, ...responseHeaders });
          stream.end();
          return;
        }

        if (headers[':method'] === 'GET') {
          const serviceFunctionArgumentInJson = headers[':path']?.split('?arg=')[1];
          serviceFunctionArgument = serviceFunctionArgumentInJson
            ? JSON.parse(serviceFunctionArgumentInJson)
            : undefined;
        } else {
          await new Promise((resolve) => {
            stream.on('data', (data) => chunks.push(data as any));
            stream.on('end', () => resolve());
          });

          const data = chunks.join('');
          serviceFunctionArgument = data ? await parseJsonAsync(data) : null;
        }
      } catch (error) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message: BACKK_ERRORS.INVALID_ARGUMENT.message + error.message,
        });
        stream.respond({ ':status': backkError.statusCode, 'Content-Type': 'application/json' });
        stream.write(JSON.stringify(backkError));
        stream.end();
        return;
      }

      const serviceFunctionName = headers[':path']?.split('/').pop() ?? '';
      const [serviceName, functionName] = serviceFunctionName.split('.');
      const ServiceClass = (microservice as any)[serviceName]?.constructor;

      if (
        typeof ServiceClass === 'function' &&
        serviceFunctionAnnotationContainer.isSubscription(ServiceClass, functionName)
      ) {
        stream.on('close', () => {
          subscriptionManager.removeSubscription(serviceFunctionName, stream);
        });

        subscriptionManager.addSubscription(serviceFunctionName, stream);
      }

      tryExecuteServiceMethod(
        microservice,
        serviceFunctionName,
        serviceFunctionArgument ?? null,
        headers,
        headers[':method'] ?? '',
        new Http2Response(stream),
        isClusterInternalCall,
        this.options
      );
    });

    function exit(signal: string) {
      server.close(() => {
        log(Severity.INFO, `HTTP server terminated due to signal: ${signal}`, '');
        process.exitCode = 0;
      });
    }

    process.once('SIGINT', exit);
    process.once('SIGQUIT', exit);
    process.once('SIGTERM', exit);

    process.on('uncaughtExceptionMonitor', () => {
      server.close();
    });

    const port = process.env.HTTP_SERVER_PORT ?? 3000;

    server.on('error', (error) => {
      log(Severity.ERROR, 'HTTP server error', error.message);
    });

    log(Severity.INFO, `HTTP server started, listening to port ${port}`, '');
    server.listen(port);
  }

  isAsyncProcessor(): boolean {
    return false;
  }

  getCommunicationMethod(): CommunicationMethod {
    return 'http';
  }
}
