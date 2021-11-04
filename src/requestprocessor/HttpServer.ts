// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import bfj from 'bfj-pksilen';
import { createServer } from 'http';
import { HttpStatusCodes, MAX_INT_VALUE } from '../constants/constants';
import { BACKK_ERRORS } from '../errors/backkErrors';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import tryExecuteServiceMethod, {
  ServiceFunctionExecutionOptions,
} from '../execution/tryExecuteServiceMethod';
import Microservice, { HttpVersion } from '../microservice/Microservice';
import log, { Severity } from '../observability/logging/log';
import { CommunicationMethod } from '../remote/messagequeue/sendToRemoteService';
import throwException from '../utils/exception/throwException';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import { RequestProcessor } from './RequestProcessor';

export default class HttpServer implements RequestProcessor {
  constructor(
    private readonly options?: ServiceFunctionExecutionOptions,
    private readonly httpVersion: HttpVersion = 1
  ) {}

  startProcessingRequests(microservice: Microservice): void {
    const server = createServer(async (request, response) => {
      request.setEncoding('utf8');

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
          process.env.NODE_ENV === 'development' ? '*' : ('https://' + request.headers.host)
        );
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
          serviceFunctionArgument = await bfj.parse(request);
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

      tryExecuteServiceMethod(
        microservice,
        request.url?.split('/').pop() ?? '',
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
