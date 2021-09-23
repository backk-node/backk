import { createServer } from "http";
import tryExecuteServiceMethod, { ServiceFunctionExecutionOptions } from "../execution/tryExecuteServiceMethod";
import Microservice from "../microservice/Microservice";
import log, { Severity } from "../observability/logging/log";
import throwException from "../utils/exception/throwException";
import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../errors/backkErrors";

export type HttpVersion = 1;

// TODO check microservice is initialized before calling this function
export default async function startHttpServerFor(
  microservice: Microservice,
  options?: ServiceFunctionExecutionOptions,
  httpVersion: HttpVersion = 1
) {
  const server = createServer((request, response) => {
    const requestBodyChunks: string[] = [];
    request.setEncoding('utf8');

    const contentLength = parseInt(request.headers['content-length'] ?? '0', 10);
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

    request.on('data', (chunk) => {
      requestBodyChunks.push(chunk);
    });

    request.on('end', () => {
      let serviceFunctionArgument;

      if (request.method === 'GET') {
        serviceFunctionArgument = request.url?.split('?arg=').pop();
      } else {
        try {
          serviceFunctionArgument =
            requestBodyChunks.length > 0 ? JSON.parse(requestBodyChunks.join('')) : null;
        } catch (error) {
          serviceFunctionArgument = null;
        }
      }

      tryExecuteServiceMethod(
        microservice,
        request.url?.split('/').pop() ?? '',
        serviceFunctionArgument,
        request.headers,
        request.method ?? '',
        response,
        options
      );
    });
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
  return server.listen(port);
}
