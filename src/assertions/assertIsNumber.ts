import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../errors/BACKK_ERRORS";

export default function assertIsNumber(propertyName: string, value: any) {
  if (typeof value !== 'number') {
    throw createBackkErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.INVALID_ARGUMENT,
      message:
        BACKK_ERRORS.INVALID_ARGUMENT.message + `value ${value} in ${propertyName} property must be a number`
    });
  }
}
