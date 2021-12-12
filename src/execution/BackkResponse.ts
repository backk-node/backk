import { HttpStatusCodes } from '../constants/constants';
import { BackkError } from '../types/BackkError';

export default class BackkResponse {
  private statusCode: number = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  private response: object | null | undefined = {};

  setHeader() {
    // No operation
  }

  writeHead(statusCode: number) {
    this.statusCode = statusCode;
  }

  end(response: object | null | undefined) {
    this.response = response;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  getResponse(): object | null | undefined {
    return this.response;
  }

  getErrorResponse(): BackkError | null {
    if (this.statusCode >= HttpStatusCodes.ERRORS_START) {
      return {
        statusCode: this.statusCode,
        errorCode: (this.response as any).errorCode,
        stackTrace: (this.response as any).stackTrace,
        message: (this.response as any).message
      };
    }

    return null;
  }
}
