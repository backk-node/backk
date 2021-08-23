import createBackkErrorFromError from "./createBackkErrorFromError";

export default function createErrorFromErrorMessageAndThrowError(errorMessage: string) {
  throw createBackkErrorFromError(new Error(errorMessage));
}
