import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForEveryUser(isAuthenticationRequired: boolean, allowDespiteOfUserIdInArg = false) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForEveryUser(
      object.constructor,
      functionName,
      allowDespiteOfUserIdInArg
    );

    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForEveryUserWithAuthentication(
      object.constructor,
      functionName,
      isAuthenticationRequired
    );
  };
}
