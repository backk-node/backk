import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';
import { FieldPathNameToFieldValueMap } from './PostTests';

export function Test(expectedResult: FieldPathNameToFieldValueMap) {
  const finalFieldPathNameToFieldValueMap = Object.entries(expectedResult).reduce(
    (finalFieldPathNameToFieldValueMap, [fieldPathName, fieldValue]) => {
      let finalFieldValue = fieldValue;

      if (typeof fieldValue === 'string' && fieldValue.startsWith('{{') && fieldValue.endsWith('}}')) {
        const idFieldName = fieldValue.slice(2, -2).trim();
        finalFieldValue = `pm.collectionVariables.get('${idFieldName}')`;
      }

      return {
        ...finalFieldPathNameToFieldValueMap,
        [fieldPathName]: finalFieldValue
      };
    },
    {}
  );

  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.expectServiceFunctionReturnValueToContainInTests(
      object.constructor,
      functionName,
      finalFieldPathNameToFieldValueMap
    );
  };
}
