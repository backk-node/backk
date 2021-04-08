import serviceFunctionAnnotationContainer from '../../../decorators/service/function/serviceFunctionAnnotationContainer';

export default function isCreateFunction(ServiceClass: Function, functionName: string) {
  return (
    functionName.startsWith('create') ||
    functionName.startsWith('insert') ||
    serviceFunctionAnnotationContainer.isCreateServiceFunction(ServiceClass, functionName)
  );
}
