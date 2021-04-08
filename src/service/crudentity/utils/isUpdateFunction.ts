import serviceFunctionAnnotationContainer
  from "../../../decorators/service/function/serviceFunctionAnnotationContainer";

export default function isUpdateFunction(ServiceClass: Function, functionName: string): boolean {
  return (
    functionName.startsWith('update') ||
    functionName.startsWith('modify') ||
    functionName.startsWith('change') ||
    functionName.startsWith('patch') ||
    !!serviceFunctionAnnotationContainer.getUpdateTypeForServiceFunction(ServiceClass, functionName)
  );
}
