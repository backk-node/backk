import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function AllowServiceForClusterInternalUse() {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addServiceAllowedForClusterInternalUse(serviceClass);
  }
}
