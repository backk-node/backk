export default function isBackkError(error: any): boolean {
  return 'statusCode' in error && 'message' in error;
}
