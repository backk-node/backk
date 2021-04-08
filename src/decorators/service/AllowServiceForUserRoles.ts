import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function AllowServiceForUserRoles(roles: string[]) {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addAllowedUserRolesForService(serviceClass, roles);
  }
}
