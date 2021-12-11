import _ from 'lodash';
import { CommunicationMethod, sendOneOrMore, SendOptions } from './sendToRemoteService';
import parseRemoteServiceFunctionCallUrlParts from '../utils/parseRemoteServiceFunctionCallUrlParts';
import getKafkaServerFromEnv from './kafka/getKafkaServerFromEnv';

export interface Transmission {
  communicationMethod: CommunicationMethod;
  microserviceName: string;
  serviceFunctionName: string;
  serviceFunctionArgument: object;
  microserviceNamespace?: string;
  server?: string;
  responseDestination?: ResponseDestination;
  options?: SendOptions;
}

export interface ResponseDestination {
  communicationMethod: CommunicationMethod;
  microserviceName: string;
  microserviceNamespace: string | undefined;
  serviceFunctionName: string;
  server: string;
}

export interface CallOrSendToUrlSpec {
  serviceFunctionUrl: string;
  serviceFunctionArgument?: object;
  sendResponseTo?: ResponseDestination;
  options?: SendOptions;
}

export default async function sendToRemoteServiceInsideTransaction(transmissions: Transmission[]) {
  const foundRedisMessageBroker = transmissions.find((send) => send.communicationMethod !== 'kafka');
  if (foundRedisMessageBroker) {
    throw new Error('You can only use sendToRemoteServiceInsideTransaction with Kafka');
  }

  const sendsWithUrl = transmissions.map(
    ({
      communicationMethod,
      server,
      microserviceName,
      microserviceNamespace,
      serviceFunctionName,
      serviceFunctionArgument,
      responseDestination,
      options
    }) => ({
      remoteServiceFunctionUrl: `${communicationMethod}://${server ??
        getKafkaServerFromEnv()}/${microserviceName}.${microserviceNamespace}/${serviceFunctionName}`,
      serviceFunctionArgument: serviceFunctionArgument,
      responseDestination,
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

  return sendOneOrMore(transmissions, true);
}
