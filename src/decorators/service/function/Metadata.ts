import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function Metadata() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addMetadataFunctionAnnotation(object.constructor, functionName);
    serviceFunctionAnnotationContainer.addNoAutoTestAnnotation(object.constructor, functionName);
  };
}
