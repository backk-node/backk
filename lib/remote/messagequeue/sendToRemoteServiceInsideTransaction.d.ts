import { SendToOptions } from './sendToRemoteService';
export interface CallOrSendTo {
    remoteServiceFunctionUrl: string;
    serviceFunctionArgument?: object;
    responseUrl?: string;
    options?: SendToOptions;
}
export default function sendToRemoteServiceInsideTransaction(sends: CallOrSendTo[]): Promise<[null | undefined, import("../../types/BackkError").BackkError | null | undefined]>;
