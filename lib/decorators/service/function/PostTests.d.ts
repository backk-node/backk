export declare type PostTestSpec = {
    testName: string;
    serviceFunctionName: string;
    argument?: {
        [key: string]: any;
    };
    expectedResult: {
        [key: string]: any;
    };
};
export declare type FieldPathNameToFieldValueMap = {
    [key: string]: any;
};
export default function PostTests(testSpecs: PostTestSpec[]): (object: Object, functionName: string) => void;
