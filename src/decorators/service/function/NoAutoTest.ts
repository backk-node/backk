import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function NoAutoTest() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addNoAutoTestAnnotation(object.constructor, functionName);
  };
}
