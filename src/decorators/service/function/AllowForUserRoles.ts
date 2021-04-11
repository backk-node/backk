import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AllowForUserRoles(roles: string[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addAllowedUserRoles(object.constructor, functionName, roles);
  };
}
