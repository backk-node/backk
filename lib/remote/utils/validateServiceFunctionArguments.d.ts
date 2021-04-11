import { CallOrSendTo } from "../messagequeue/sendToRemoteServiceInsideTransaction";
export declare const remoteServiceNameToControllerMap: {
    [key: string]: any;
};
export declare function validateServiceFunctionArguments(sends: CallOrSendTo[]): Promise<void>;
