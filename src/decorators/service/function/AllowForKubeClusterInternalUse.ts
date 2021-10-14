import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForKubeClusterInternalUse() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForClusterInternalUse(
      object.constructor,
      functionName
    );
  };
}
