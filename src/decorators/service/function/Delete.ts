import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function Delete() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addDeleteAnnotation(object.constructor, functionName);
  };
}
