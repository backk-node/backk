import { createServer } from "http";
import tryExecuteServiceMethod, { ServiceFunctionExecutionOptions } from "../execution/tryExecuteServiceMethod";
import Microservice from "../microservice/Microservice";
import log, { Severity } from "../observability/logging/log";

export type HttpVersion = 1;

// TODO check microservice is initialized before calling this function
export default async function startHttpServerFor(
  microservice: Microservice,
  options?: ServiceFunctionExecutionOptions,
  httpVersion: HttpVersion = 1
) {
  const server = createServer((request, response) => {
    const requestBodyChunks: string[] = [];

    request.on('data', (chunk) => {
      requestBodyChunks.push(chunk);
    });

    request.on('end', () => {
      let serviceFunctionArgument;

      if (request.method === 'GET') {
        serviceFunctionArgument = request.url?.split('?arg=').pop();
      } else {
        serviceFunctionArgument = JSON.parse(requestBodyChunks.join(''));
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

  const port = process.env.port ?? 3000;
  log(Severity.INFO, `HTTP server started, listening to port ${port}`, '')
  return server.listen(port);
}
