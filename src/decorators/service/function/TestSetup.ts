import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export type TestSetupSpec = {
  setupStepName: string;
  serviceFunctionName: string;
  argument?: {
    [key: string]: any;
  };
  postmanTests?: string[];
};

export function TestSetup(serviceFunctionsOrSpecsToExecute: (string | TestSetupSpec)[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addTestSetup(
      object.constructor,
      functionName,
      serviceFunctionsOrSpecsToExecute
    );
  };
}
