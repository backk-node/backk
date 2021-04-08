import serviceAnnotationContainer from "./serviceAnnotationContainer";

export default function NoAutoTests() {
  return function(serviceClass: Function) {
    serviceAnnotationContainer.addNoAutoTestsAnnotationToServiceClass(serviceClass);
  }
}
