## Errors

List of Backk error definitions:

```ts
export const BACKK_ERRORS = {
  ENTITY_VERSION_MISMATCH: {
    errorCode: 'error.1',
    message:
      'Entity version conflict. Entity was updated before this request, please re-fetch the entity and try update again',
    statusCode: HttpStatusCodes.CONFLICT
  },
  ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH: {
    errorCode: 'error.2',
    message:
      'Entity last modified timestamp conflict. Entity was updated before this request, please re-fetch the entity and try update again',
    statusCode: HttpStatusCodes.CONFLICT
  },
  DUPLICATE_ENTITY: {
    errorCode: 'error.3',
    message: 'Duplicate entity',
    statusCode: HttpStatusCodes.CONFLICT
  },
  ENTITY_NOT_FOUND: {
    errorCode: 'error.4',
    message: 'Entity not found',
    statusCode: HttpStatusCodes.NOT_FOUND
  },
  INVALID_ARGUMENT: {
    errorCode: 'error.5',
    message: 'Invalid argument: ',
    statusCode: HttpStatusCodes.BAD_REQUEST
  },
  SERVICE_FUNCTION_CALL_NOT_AUTHORIZED: {
    errorCode: 'error.6',
    message: 'Service function call not authorized',
    statusCode: HttpStatusCodes.FORBIDDEN
  },
  MAX_ENTITY_COUNT_REACHED: {
    errorCode: 'error.7',
    message: 'Maximum sub-entity count reached. Cannot add new sub-entity',
    statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY
  },
  UNKNOWN_SERVICE: {
    errorCode: 'error.8',
    message: 'Unknown service: ',
    statusCode: HttpStatusCodes.NOT_FOUND
  },
  UNKNOWN_SERVICE_FUNCTION: {
    errorCode: 'error.9',
    message: 'Unknown function: ',
    statusCode: HttpStatusCodes.NOT_FOUND
  },
  MISSING_SERVICE_FUNCTION_ARGUMENT: {
    errorCode: 'error.10',
    message: 'Missing service function argument',
    statusCode: HttpStatusCodes.NOT_ACCEPTABLE
  },
  REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED: {
    errorCode: 'error.11',
    message: 'Remote service function call not allowed',
    statusCode: HttpStatusCodes.FORBIDDEN
  },
  TOO_MANY_SERVICE_FUNCTIONS_CALLED: {
    errorCode: 'error.12',
    message: 'Too many service functions called',
    statusCode: HttpStatusCodes.TOO_MANY_REQUESTS
  },
  REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED_INSIDE_TRANSACTION: {
    errorCode: 'error.13',
    message: 'Remote service function call not allowed inside transaction',
    statusCode: HttpStatusCodes.BAD_REQUEST
  },
  ALLOWED_REMOTE_SERVICE_FUNCTIONS_REGEXP_PATTERN_NOT_DEFINED: {
    errorCode: 'error.14',
    message: 'Allowed remote service functions regular expression pattern not defined',
    statusCode: HttpStatusCodes.BAD_REQUEST
  },
  HTTP_METHOD_MUST_BE_POST: {
    errorCode: 'error.15',
    message: 'Invalid HTTP method. HTTP method must be POST',
    statusCode: HttpStatusCodes.METHOD_NOT_ALLOWED
  },
  REQUEST_IS_TOO_LONG: {
    errorCode: 'error.16',
    message: 'Request is too long',
    statusCode: HttpStatusCodes.PAYLOAD_TOO_LARGE
  },
  USER_NOT_AUTHENTICATED: {
    errorCode: 'error.17',
    message: 'User is not authenticated',
    statusCode: HttpStatusCodes.UNAUTHORIZED
  },
  INVALID_HTTP_METHOD: {
    errorCode: 'error.18',
    message: 'Invalid HTTP method. HTTP method must be POST or GET',
    statusCode: HttpStatusCodes.METHOD_NOT_ALLOWED
  },
  MICROSERVICE_NOT_READY: {
    errorCode: 'error.19',
    message: 'Microservice is not ready',
    statusCode: HttpStatusCodes.SERVICE_UNAVAILABLE
  },
  MICROSERVICE_NOT_STARTED: {
    errorCode: 'error.20',
    message: 'Microservice is not started',
    statusCode: HttpStatusCodes.SERVICE_UNAVAILABLE
  }
};
```
