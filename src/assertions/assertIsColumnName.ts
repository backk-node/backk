import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { backkErrors } from "../errors/backkErrors";

export default function assertIsColumnName(propertyName: string, columnName: string) {
  if (columnName.match(/^[a-zA-Z_][a-zA-Z0-9_.]*$/) == null) {
    throw createBackkErrorFromErrorCodeMessageAndStatus({
      ...backkErrors.INVALID_ARGUMENT,
      message:
        backkErrors.INVALID_ARGUMENT.message +
        `value ${columnName} in ${propertyName} property is not a valid column name`
    });
  }
}
