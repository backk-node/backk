import createBackkErrorFromError from './createBackkErrorFromError';
import { HttpStatusCodes } from '../constants/constants';
import { BackkError } from "../types/BackkError";

export default function createBackkErrorFromErrorCodeMessageAndStatus(
  errorCodeMessageAndStatus: BackkError
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
