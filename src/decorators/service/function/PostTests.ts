import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export type PostTestSpec = {
  testName: string;
  serviceFunctionName: string;
  argument?: {
    [key: string]: any;
  },
  expectedResult: {
    [key: string]: any;
  };
};

export type FieldPathNameToFieldValueMap = {
  [key: string]: any;
};

export function PostTests(testSpecs: PostTestSpec[]) {
  testSpecs.forEach(testSpec => {
    testSpec.expectedResult = Object.entries(
      testSpec.expectedResult
    ).reduce((finalExpectedResult, [fieldPathName, fieldValue]) => {
      let finalFieldValue = fieldValue;

      if (typeof fieldValue === 'string' && fieldValue.startsWith('{{') && fieldValue.endsWith('}}')) {
        const idFieldName = fieldValue.slice(2, -2).trim();
        finalFieldValue = `pm.collectionVariables.get('${idFieldName}')`;
      }

      return {
        ...finalExpectedResult,
        [fieldPathName]: finalFieldValue
      };
    }, {});
  })


  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.expectServiceFunctionEntityToContainInTests(
      object.constructor,
      functionName,
      testSpecs
    );
  };
}
