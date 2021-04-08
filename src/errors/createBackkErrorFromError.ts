import { BackkError, backkErrorSymbol } from "../types/BackkError";
import log, { Severity } from '../observability/logging/log';
import { HttpStatusCodes } from '../constants/constants';

export default function createBackkErrorFromError(error: Error): BackkError {
  let statusCode = parseInt(error.message.slice(0, 3));
  let message = error.message.slice(4);

  if (isNaN(statusCode)) {
    statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    message = error.message;
  }

  let errorCode;
  const ERROR_CODE_PREFIX = 'Error code ';

  if (message.startsWith(ERROR_CODE_PREFIX)) {
    const [errorCodeStr, ...errorMessageParts] = message.split(':');
    errorCode = errorCodeStr.slice(ERROR_CODE_PREFIX.length);
    message = errorMessageParts.join(':').trim();
  }

  log(Severity.DEBUG, message, error.stack ?? '', { errorCode, statusCode });

  if (statusCode >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
    log(Severity.ERROR, message, error.stack ?? '', { errorCode, statusCode });
  }

  return {
    [backkErrorSymbol]: true,
    statusCode,
    errorCode,
    message,
    stackTrace:
      (process.env.LOG_LEVEL === 'DEBUG' || process.env.NODE_ENV === 'development') &&
      statusCode === HttpStatusCodes.INTERNAL_SERVER_ERROR
        ? error.stack
        : undefined
  };
}
