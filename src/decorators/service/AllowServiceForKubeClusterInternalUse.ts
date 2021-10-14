import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function AllowServiceForKubeClusterInternalUse() {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addServiceAllowedForClusterInternalUse(serviceClass);
  }
}
