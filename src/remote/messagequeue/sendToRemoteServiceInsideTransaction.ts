import _ from 'lodash';
import { sendOneOrMore, SendToOptions } from './sendToRemoteService';
import parseRemoteServiceFunctionCallUrlParts from '../utils/parseRemoteServiceFunctionCallUrlParts';

export interface CallOrSendToSpec {
  remoteServiceFunctionUrl: string;
  serviceFunctionArgument?: object;
  responseUrl?: string;
  options?: SendToOptions;
}

export default async function sendToRemoteServiceInsideTransaction(sends: CallOrSendToSpec[]) {
  const uniqueSendTosByBroker = _.uniqBy(
    sends,
    ({ remoteServiceFunctionUrl }) => parseRemoteServiceFunctionCallUrlParts(remoteServiceFunctionUrl).server
  );

  if (uniqueSendTosByBroker.length !== 1) {
    throw new Error('All sendTos must be to same Kafka server');
  }

  return sendOneOrMore(sends, true);
}
