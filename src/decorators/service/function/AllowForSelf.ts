import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForSelf() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForSelf(
      object.constructor,
      functionName
    );
  };
}
