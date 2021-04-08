export default function isExecuteMultipleRequest(serviceFunctionName: string) {
  if (
    serviceFunctionName === 'executeMultipleInParallelInsideTransaction' ||
    serviceFunctionName === 'executeMultipleInParallelWithoutTransaction' ||
    serviceFunctionName === 'executeMultipleInSequenceInsideTransaction' ||
    serviceFunctionName === 'executeMultipleInSequenceWithoutTransaction'
  ) {
    return true;
  }

  return false;
}
