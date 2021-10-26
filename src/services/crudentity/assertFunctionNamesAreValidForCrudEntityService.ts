import isCreateFunction from './utils/isCreateFunction';
import isReadFunction from './utils/isReadFunction';
import isUpdateFunction from './utils/isUpdateFunction';
import isDeleteFunction from './utils/isDeleteFunction';
import serviceFunctionAnnotationContainer
  from "../../decorators/service/function/serviceFunctionAnnotationContainer";

export default function assertFunctionNamesAreValidForCrudEntityService(
  ServiceClass: Function,
  functionNames: string[]
) {
  return functionNames.forEach((functionName) => {
    if (
      !isCreateFunction(ServiceClass, functionName) &&
      !isReadFunction(ServiceClass, functionName) &&
      !isUpdateFunction(ServiceClass, functionName) &&
      !isDeleteFunction(ServiceClass, functionName) &&
      !serviceFunctionAnnotationContainer.hasOnStartUp(ServiceClass, functionName)
    ) {
      throw new Error(
        'Invalid function name: ' +
          ServiceClass.name +
          '.' +
          functionName +
          `\n
      Follow CrudResourceService naming conventions:
      - Create function names must start with create or insert
      - Read function names must start with get, read, find, fetch, retrieve, obtain
      - Update function names must start with update, modify, change, patch
      - Delete function names must start with delete, erase, destroy
      Alternatively, annotate functions with one of following: @Create(), @Read(), @Update(), @Delete()
      `
      );
    }
  });
}
