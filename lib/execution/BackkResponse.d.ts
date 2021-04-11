import { BackkError } from '../types/BackkError';
export default class BackkResponse {
    private statusCode;
    private response;
    status(statusCode: number): void;
    send(response: object | null | undefined): void;
    getStatusCode(): number;
    getResponse(): object | null | undefined;
    getErrorResponse(): BackkError | null;
}
