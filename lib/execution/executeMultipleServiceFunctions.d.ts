import { ExecuteServiceFunctionOptions } from "./tryExecuteServiceMethod";
export default function executeMultipleServiceFunctions(isConcurrent: boolean, shouldExecuteInsideTransaction: boolean, controller: any, serviceFunctionCalls: object, headers: {
    [key: string]: string;
}, resp?: any, options?: ExecuteServiceFunctionOptions): Promise<void | object>;
