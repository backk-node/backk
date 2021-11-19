import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { backkErrors } from "../errors/backkErrors";

export default function assertIsNumber(propertyName: string, value: any) {
  if (typeof value !== 'number') {
    throw createBackkErrorFromErrorCodeMessageAndStatus({
      ...backkErrors.INVALID_ARGUMENT,
      message:
        backkErrors.INVALID_ARGUMENT.message + `value ${value} in ${propertyName} property must be a number`
    });
  }
}
