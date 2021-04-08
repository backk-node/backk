import callRemoteService, { HttpRequestOptions } from './callRemoteService';

export default async function makeHttpRequest<T>(
  requestUrl: string,
  requestBodyObject: object,
  options?: HttpRequestOptions
) {
  return await callRemoteService(requestUrl, requestBodyObject, options);
}
