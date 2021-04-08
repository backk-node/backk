import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export function AllowForUserRoles(roles: string[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addAllowedUserRoles(object.constructor, functionName, roles);
  };
}
