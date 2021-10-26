import serviceFunctionAnnotationContainer from '../../../decorators/service/function/serviceFunctionAnnotationContainer';

export default function isDeleteFunction(ServiceClass: Function, functionName: string) {
  return (
    functionName.startsWith('delete') ||
    functionName.startsWith('erase') ||
    functionName.startsWith('destroy') ||
    serviceFunctionAnnotationContainer.isDeleteServiceFunction(ServiceClass, functionName)
  );
}
