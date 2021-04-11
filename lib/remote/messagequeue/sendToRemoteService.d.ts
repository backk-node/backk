import { CompressionTypes } from 'kafkajs';
import { CallOrSendTo } from './sendToRemoteServiceInsideTransaction';
import { SendAcknowledgementType } from './kafka/sendOneOrMoreToKafka';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
export interface SendToOptions {
    compressionType?: CompressionTypes;
    sendAcknowledgementType?: SendAcknowledgementType;
}
export declare function sendOneOrMore(sends: CallOrSendTo[], isTransactional: boolean): PromiseErrorOr<null>;
export default function sendToRemoteService(remoteServiceFunctionUrl: string, serviceFunctionArgument: object, responseUrl?: string, options?: SendToOptions): PromiseErrorOr<null>;
