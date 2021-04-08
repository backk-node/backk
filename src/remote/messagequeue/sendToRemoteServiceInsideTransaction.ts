import _ from 'lodash';
import { sendOneOrMore, SendToOptions } from './sendToRemoteService';
import parseRemoteServiceFunctionCallUrlParts from '../utils/parseRemoteServiceFunctionCallUrlParts';

export interface CallOrSendTo {
  remoteServiceFunctionUrl: string;
  serviceFunctionArgument?: object;
  responseUrl?: string;
  options?: SendToOptions;
}

export default async function sendToRemoteServiceInsideTransaction(sends: CallOrSendTo[]) {
  const uniqueSendTosByBroker = _.uniqBy(
    sends,
    ({ remoteServiceFunctionUrl }) => parseRemoteServiceFunctionCallUrlParts(remoteServiceFunctionUrl).server
  );

  if (uniqueSendTosByBroker.length !== 1) {
    throw new Error('All sendTos must be to same Kafka server');
  }

  return await sendOneOrMore(sends, true);
}
