import { SendToOptions } from './sendToRemoteService';
export interface CallOrSendToSpec {
    remoteServiceFunctionUrl: string;
    serviceFunctionArgument?: object;
    responseUrl?: string;
    options?: SendToOptions;
}
export default function sendToRemoteServiceInsideTransaction(sends: CallOrSendToSpec[]): Promise<[null | undefined, import("../..").BackkError | null | undefined]>;
