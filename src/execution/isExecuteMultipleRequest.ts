export default function isExecuteMultipleRequest(serviceFunctionName: string) {
  if (
    serviceFunctionName === 'executeMultipleServiceFunctionsInParallelInsideTransaction' ||
    serviceFunctionName === 'executeMultipleServiceFunctionsInParallelWithoutTransaction' ||
    serviceFunctionName === 'executeMultipleServiceFunctionsInSequenceInsideTransaction' ||
    serviceFunctionName === 'executeMultipleServiceFunctionsInSequenceWithoutTransaction'
  ) {
    return true;
  }

  return false;
}
