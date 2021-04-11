import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForTests() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForTests(object.constructor, functionName);
  };
}
