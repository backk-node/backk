import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../errors/BACKK_ERRORS";

export default function assertIsColumnName(columnName: string) {
  if (columnName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) == null) {
    throw createBackkErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.INVALID_ARGUMENT,
      message:
        BACKK_ERRORS.INVALID_ARGUMENT.message +
        `value ${columnName} is not a valid column name`
    });
  }
}
