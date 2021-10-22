import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForEveryUser(allowDespiteOfUserIdInArg = false) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForEveryUser(
      object.constructor,
      functionName,
      allowDespiteOfUserIdInArg
    );
  };
}
