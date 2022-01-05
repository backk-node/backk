import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function AllowServiceForEveryUser(isAuthenticationRequired: boolean) {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addServiceAllowedForEveryUser(serviceClass, isAuthenticationRequired);
  }
}
