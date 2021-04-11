import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function ExecuteOnStartUp() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addOnStartUpAnnotation(object.constructor, functionName);
  };
}
