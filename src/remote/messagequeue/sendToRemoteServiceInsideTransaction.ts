import _ from 'lodash';
import { CommunicationMethod, sendOneOrMore, SendToOptions } from './sendToRemoteService';
import parseRemoteServiceFunctionCallUrlParts from '../utils/parseRemoteServiceFunctionCallUrlParts';
import getKafkaServerFromEnv from './kafka/getKafkaServerFromEnv';

export interface RemoteCallOrSendToSpec {
  communicationMethod: CommunicationMethod;
  microserviceName: string;
  serviceFunctionName: string;
  serviceFunctionArgument: object;
  microserviceNamespace?: string;
  server?: string;
  sendResponseTo?: ResponseSendToSpec;
  options?: SendToOptions;
}

export interface ResponseSendToSpec {
  communicationMethod: CommunicationMethod;
  microserviceName: string;
  microserviceNamespace: string | undefined;
  serviceFunctionName: string;
  server: string;
}

export interface CallOrSendToUrlSpec {
  serviceFunctionUrl: string;
  serviceFunctionArgument?: object;
  sendResponseTo?: ResponseSendToSpec;
  options?: SendToOptions;
}

export default async function sendToRemoteServiceInsideTransaction(sends: RemoteCallOrSendToSpec[]) {
  const foundRedisMessageBroker = sends.find((send) => send.communicationMethod !== 'kafka');
  if (foundRedisMessageBroker) {
    throw new Error('You can only use sendToRemoteServiceInsideTransaction with Kafka');
  }

  const sendsWithUrl = sends.map(
    ({
      communicationMethod,
      server,
      microserviceName,
      microserviceNamespace,
      serviceFunctionName,
      serviceFunctionArgument,
      sendResponseTo,
      options
    }) => ({
      remoteServiceFunctionUrl: `${communicationMethod}://${server ??
        getKafkaServerFromEnv()}/${microserviceName}.${microserviceNamespace}/${serviceFunctionName}`,
      serviceFunctionArgument: serviceFunctionArgument,
      sendResponseTo,
      options
    })
  );

  const uniqueSendTosByBroker = _.uniqBy(
    sendsWithUrl,
    ({ remoteServiceFunctionUrl }) => parseRemoteServiceFunctionCallUrlParts(remoteServiceFunctionUrl).server
  );

  if (uniqueSendTosByBroker.length !== 1) {
    throw new Error('All sendTos must be to same Kafka server');
  }

  return sendOneOrMore(sends, true);
}
