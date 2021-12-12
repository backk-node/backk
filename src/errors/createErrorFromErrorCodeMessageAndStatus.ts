import { HttpStatusCodes } from '../constants/constants';
import { ErrorDefinition } from '../types/ErrorDefinition';

export default function createErrorFromErrorCodeMessageAndStatus(
  errorCodeMessageAndStatus: ErrorDefinition
): Error {
  return new Error(
    (errorCodeMessageAndStatus.statusCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR) +
      ':Error code ' +
      errorCodeMessageAndStatus.errorCode +
      ':' +
      errorCodeMessageAndStatus.message
  );
}
