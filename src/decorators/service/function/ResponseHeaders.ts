import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export type HeaderValueGenerator<T extends object, U extends any> = (
  argument: T,
  returnValue: U
) => string | undefined;
export type HttpHeaders<T extends object, U extends any> = {
  [key: string]: string | HeaderValueGenerator<T, U> | undefined;
};

export function ResponseHeaders<T extends object, U extends any>(headers: HttpHeaders<T, U>) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addResponseHeadersForServiceFunction<T, U>(
      object.constructor,
      functionName,
      headers
    );
  };
}
