import typeAnnotationContainer from './typePropertyAnnotationContainer';
import { HttpRequestOptions } from '../../remote/http/callRemoteService';

export default function FetchFromRemoteService<T, U>(
  remoteMicroserviceName: string,
  remoteServiceFunctionName: string,
  buildRemoteServiceFunctionArgument: (arg: T, response: U) => { [key: string]: any },
  remoteMicroserviceNamespace = process.env.MICROSERVICE_NAMESPACE,
  options?: HttpRequestOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsFetchedFromRemoteService(
      object.constructor,
      propertyName,
      remoteMicroserviceName,
      remoteMicroserviceNamespace,
      remoteServiceFunctionName,
      buildRemoteServiceFunctionArgument,
      options
    );
  };
}
