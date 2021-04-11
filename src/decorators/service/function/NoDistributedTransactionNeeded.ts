import serviceFunctionAnnotationContainer from "./serviceFunctionAnnotationContainer";

export default function NoDistributedTransactionNeeded(reason: string) {
  if (!reason) {
    throw new Error('reason must be provided for @NoDistributedTransactionNeeded annotation');
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addNonDistributedTransactionalServiceFunction(object.constructor, functionName);
  };
}
