import serviceFunctionAnnotationContainer from "./serviceFunctionAnnotationContainer";

export function NoTransaction(reason: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    if (!reason) {
      throw new Error('reason must be provided for @NoTransaction annotation');
    }
    serviceFunctionAnnotationContainer.addNonTransactionalServiceFunction(object.constructor, functionName);
  };
}
