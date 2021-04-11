import typeAnnotationContainer from './typePropertyAnnotationContainer';
import { HttpRequestOptions } from "../../remote/http/callRemoteService";

export default function FetchFromRemoteService<T, U>(
  remoteServiceFunctionUrl: string,
  buildRemoteServiceFunctionArgument: (arg: T, response: U) => { [key: string]: any },
  options?: HttpRequestOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsFetchedFromRemoteService(
      object.constructor,
      propertyName,
      remoteServiceFunctionUrl,
      buildRemoteServiceFunctionArgument,
      options
    );
  };
}
