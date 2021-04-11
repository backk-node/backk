import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForServiceInternalUse() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForServiceInternalUse(object.constructor, functionName);
  };
}
