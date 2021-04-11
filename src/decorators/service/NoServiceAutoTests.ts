import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function NoServiceAutoTests() {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addNoAutoTestsAnnotationToServiceClass(serviceClass);
  }
}
