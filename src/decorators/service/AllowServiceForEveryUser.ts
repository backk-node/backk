import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function AllowServiceForEveryUser() {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addServiceAllowedForEveryUser(serviceClass);
  }
}
