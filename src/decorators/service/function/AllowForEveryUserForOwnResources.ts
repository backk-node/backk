import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

// TODO: check if service function argument contains userId or userAccountId then
// there should be a parameter in allowForEveryUser that tells it really is for every user allowed, not only for own resources
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
