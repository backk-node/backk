import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForEveryUser() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForEveryUser(
      object.constructor,
      functionName
    );
  };
}
