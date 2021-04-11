export declare type TestSetupSpec = {
    setupStepName: string;
    serviceFunctionName: string;
    argument?: {
        [key: string]: any;
    };
    postmanTests?: string[];
};
export declare function TestSetup(serviceFunctionsOrSpecsToExecute: (string | TestSetupSpec)[]): (object: Object, functionName: string) => void;
