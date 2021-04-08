import { ErrorDef } from "../dbmanager/hooks/PreHook";
import { HttpStatusCodes } from "../constants/constants";

export default function createErrorFromErrorCodeMessageAndStatus(errorCodeMessageAndStatus: ErrorDef): Error {
  return new Error(
    (errorCodeMessageAndStatus.statusCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR) +
    ':Error code ' +
    errorCodeMessageAndStatus.errorCode +
    ':' +
    errorCodeMessageAndStatus.message
  )
}
