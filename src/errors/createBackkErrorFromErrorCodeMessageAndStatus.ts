import { ErrorDef } from '../dbmanager/hooks/PreHook';
import createBackkErrorFromError from './createBackkErrorFromError';
import { HttpStatusCodes } from '../constants/constants';

export default function createBackkErrorFromErrorCodeMessageAndStatus(
  errorCodeMessageAndStatus: ErrorDef
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
