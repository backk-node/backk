export default function createErrorMessageWithStatusCode(
  errorMessage: string,
  statusCode: number
): string {
  return statusCode + ':' + errorMessage;
}
