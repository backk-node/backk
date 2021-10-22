import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForEveryUserForOwnResources(userAccountIdFieldName: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForEveryUserForOwnResources(
      object.constructor,
      functionName,
      userAccountIdFieldName
    );
  };
}
