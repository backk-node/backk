import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function NoCaptcha(reason: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addNoCaptchaAnnotation(object.constructor, functionName);
  };
}
