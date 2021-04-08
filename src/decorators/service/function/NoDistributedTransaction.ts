import serviceFunctionAnnotationContainer from "./serviceFunctionAnnotationContainer";

export function NoDistributedTransaction(reason: string) {
  if (!reason) {
    throw new Error('reason must be provided for @NoTransaction annotation');
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addNonDistributedTransactionalServiceFunction(object.constructor, functionName);
  };
}
