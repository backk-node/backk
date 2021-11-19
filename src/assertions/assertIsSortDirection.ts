import createBackkErrorFromErrorCodeMessageAndStatus
  from "../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { backkErrors } from "../errors/backkErrors";

export default function assertIsSortDirection(value: any) {
  if (value.toUpperCase() !== 'ASC' && value.toUpperCase() !== 'DESC') {
    throw createBackkErrorFromErrorCodeMessageAndStatus({
      ...backkErrors.INVALID_ARGUMENT,
      message:
        backkErrors.INVALID_ARGUMENT.message + `${value} in 'sortDirection' property is not a valid sort direction`
    });
  }
}
