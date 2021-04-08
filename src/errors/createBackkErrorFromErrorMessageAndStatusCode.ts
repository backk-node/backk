import createErrorMessageWithStatusCode from "./createErrorMessageWithStatusCode";
import createBackkErrorFromError from "./createBackkErrorFromError";

export default function createBackkErrorFromErrorMessageAndStatusCode(errorMessage: string, statusCode: number) {
  const finalErrorMessage = createErrorMessageWithStatusCode(errorMessage, statusCode);
  return createBackkErrorFromError(new Error(finalErrorMessage));
}
