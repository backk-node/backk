import { HttpStatusCodes } from "../constants/constants";
import { BackkError } from "../types/BackkError";

export default function createErrorFromErrorCodeMessageAndStatus(
  errorCodeMessageAndStatus: BackkError
): Error {
  return new Error(
    (errorCodeMessageAndStatus.statusCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR) +
      ':Error code ' +
      errorCodeMessageAndStatus.errorCode +
      ':' +
      errorCodeMessageAndStatus.message
  );
}
