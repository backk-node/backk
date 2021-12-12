import createBackkErrorFromError from './createBackkErrorFromError';
import { HttpStatusCodes } from '../constants/constants';
import { ErrorDefinition } from "../types/ErrorDefinition";

export default function createBackkErrorFromErrorCodeMessageAndStatus(
  errorCodeMessageAndStatus: ErrorDefinition
) {
  return createBackkErrorFromError(
    new Error(
      (errorCodeMessageAndStatus.statusCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR) +
        ':Error code ' +
        errorCodeMessageAndStatus.errorCode +
        ':' +
        errorCodeMessageAndStatus.message
    )
  );
}
