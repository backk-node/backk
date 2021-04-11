export interface ExecuteServiceFunctionOptions {
    httpMethod?: 'POST' | 'GET';
    allowedServiceFunctionsRegExpForHttpGetMethod?: RegExp;
    deniedServiceFunctionsForForHttpGetMethod?: string[];
    isMetadataServiceEnabled?: boolean;
    areMultipleServiceFunctionExecutionsAllowed?: boolean;
    maxServiceFunctionCountInMultipleServiceFunctionExecution?: number;
    shouldAllowTemplatesInMultipleServiceFunctionExecution?: boolean;
    allowedServiceFunctionsRegExpForRemoteServiceCalls?: RegExp;
}
export default function tryExecuteServiceMethod(controller: any, serviceFunctionName: string, serviceFunctionArgument: any, headers: {
    [key: string]: string;
}, resp?: any, options?: ExecuteServiceFunctionOptions, shouldCreateClsNamespace?: boolean): Promise<void | object>;
