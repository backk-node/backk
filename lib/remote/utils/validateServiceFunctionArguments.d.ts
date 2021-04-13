import { CallOrSendToSpec } from "../messagequeue/sendToRemoteServiceInsideTransaction";
export declare const remoteServiceNameToControllerMap: {
    [key: string]: any;
};
export declare function validateServiceFunctionArguments(sends: CallOrSendToSpec[]): Promise<void>;
