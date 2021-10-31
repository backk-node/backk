import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowHttpGetMethod() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowHttpGetMethod(object.constructor, functionName);
  };
}
