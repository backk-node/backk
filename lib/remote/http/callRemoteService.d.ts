import { PromiseErrorOr } from '../../types/PromiseErrorOr';
export interface HttpRequestOptions {
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}
export default function callRemoteService(remoteServiceFunctionUrl: string, serviceFunctionArgument?: object, options?: HttpRequestOptions): PromiseErrorOr<object>;
