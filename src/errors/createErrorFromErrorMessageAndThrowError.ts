import { HttpException } from "@nestjs/common";
import createBackkErrorFromError from "./createBackkErrorFromError";

export default function createErrorFromErrorMessageAndThrowError(errorMessage: string) {
  const errorResponse = createBackkErrorFromError(new Error(errorMessage));
  throw new HttpException(errorResponse, errorResponse.statusCode);
}
