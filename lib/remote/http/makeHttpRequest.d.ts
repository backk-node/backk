import { HttpRequestOptions } from './callRemoteService';
export default function makeHttpRequest<T>(requestUrl: string, requestBodyObject: object, options?: HttpRequestOptions): Promise<[object | null | undefined, import("../..").BackkError | null | undefined]>;
