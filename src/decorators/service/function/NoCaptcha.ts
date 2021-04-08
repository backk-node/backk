import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function NoCaptcha() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addNoCaptchaAnnotation(object.constructor, functionName);
  };
}
