export default function isReadFunction(serviceClass: Function, functionName: string) {
  return functionName.startsWith('get') ||
    functionName.startsWith('find') ||
    functionName.startsWith('read') ||
    functionName.startsWith('fetch') ||
    functionName.startsWith('retrieve') ||
    functionName.startsWith('obtain');
}
