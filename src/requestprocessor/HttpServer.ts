// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import bfj from 'bfj';
import { RequestProcessor } from './RequestProcessor';
import tryExecuteServiceMethod, {
  ServiceFunctionExecutionOptions
} from '../execution/tryExecuteServiceMethod';
import { HttpVersion } from '../microservice/Microservice';
import { createServer } from 'http';
import throwException from '../utils/exception/throwException';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../errors/backkErrors';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import log, { Severity } from '../observability/logging/log';

export default class HttpServer implements RequestProcessor {
  constructor(
    private readonly options?: ServiceFunctionExecutionOptions,
    private readonly httpVersion: HttpVersion = 1
  ) {}

  startProcessingRequests(): void {
    const server = createServer(async (request, response) => {
      request.setEncoding('utf8');

      const contentLength = request.headers['content-length']
        ? parseInt(request.headers['content-length'], 10)
        : Number.MAX_SAFE_INTEGER;

      const MAX_REQUEST_CONTENT_LENGTH_IN_BYTES = parseInt(
        process.env.MAX_REQUEST_CONTENT_LENGTH_IN_BYTES ??
          throwException('MAX_REQUEST_CONTENT_LENGTH_IN_BYTES environment variable must be defined'),
        10
      );

      if (contentLength === undefined || contentLength > MAX_REQUEST_CONTENT_LENGTH_IN_BYTES) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.REQUEST_IS_TOO_LONG);
        response.writeHead(backkError.statusCode, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(backkError));
        return;
      }

      const isClusterInternalCall = !request.url?.includes(getNamespacedMicroserviceName());

      let serviceFunctionArgument;

      try {
        if (request.method === 'GET') {
          const argumentInJsonQueryParameter = request.url?.split('?arg=').pop();
          serviceFunctionArgument = argumentInJsonQueryParameter
            ? JSON.parse(argumentInJsonQueryParameter)
            : undefined;
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          serviceFunctionArgument = await bfj.parse(request);
        }
      } catch (error) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message: BACKK_ERRORS.INVALID_ARGUMENT.message + error.message
        });
        response.writeHead(backkError.statusCode, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(backkError));
        return;
      }

      tryExecuteServiceMethod(
        this,
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
}
