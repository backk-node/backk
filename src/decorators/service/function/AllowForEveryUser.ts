import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function AllowForEveryUser() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForEveryUser(
      object.constructor,
      functionName
    );
  };
}
