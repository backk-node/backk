import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function ResponseStatusCode(statusCode: number) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addResponseStatusCodeForServiceFunction(
      object.constructor,
      functionName,
      statusCode
    );
  };
}
