declare class TestValueContainer {
    private testValues;
    private expectAnyTestValue;
    private testValuesToEvaluateTrue;
    addTestValue(type: Function, propertyName: string, testValue: any): void;
    addExpectTestValueToMatch(type: Function, propertyName: string, func: (entity: any) => boolean): void;
    addExpectAnyTestValue(type: Function, propertyName: string): void;
    getTestValue(type: Function, propertyName: string): any;
    getTestValueToEvaluateTrue(type: Function, propertyName: string): ((entity: any) => boolean) | undefined;
    getExpectAnyTestValue(type: Function, propertyName: string): boolean | undefined;
}
declare const _default: TestValueContainer;
export default _default;
