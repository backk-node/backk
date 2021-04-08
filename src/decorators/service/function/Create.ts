import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function Create() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addCreateAnnotation(object.constructor, functionName);
  };
}
