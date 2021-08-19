import { createServer } from 'http';
import tryExecuteServiceMethod, {
  ServiceFunctionExecutionOptions
} from '../execution/tryExecuteServiceMethod';
import Microservice from '../microservice/Microservice';

export type HttpVersion = 1;

export default async function startHttpServer(
  microservice: Microservice,
  options: ServiceFunctionExecutionOptions,
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

  server.listen(8000);
}
