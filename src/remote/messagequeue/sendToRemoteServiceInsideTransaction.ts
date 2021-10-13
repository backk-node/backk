import _ from "lodash";
import { CommunicationMethod, sendOneOrMore, SendToOptions } from "./sendToRemoteService";
import parseRemoteServiceFunctionCallUrlParts from "../utils/parseRemoteServiceFunctionCallUrlParts";

export interface CallOrSendToSpec {
  communicationMethod: CommunicationMethod;
  remoteMicroserviceName: string;
  remoteServiceFunctionName: string;
  remoteServiceFunctionArgument?: object;
  remoteMicroserviceNamespace: string | undefined;
  server: string;
  sendResponseTo?: CallOrSendToSpec;
  options?: SendToOptions;
}

export interface ResponseSendToSpec {
  communicationMethod: CommunicationMethod;
  remoteMicroserviceName: string;
  remoteMicroserviceNamespace: string | undefined;
  remoteServiceFunctionName: string;
  server: string;
}

export interface CallOrSendToUrlSpec {
  remoteServiceFunctionUrl: string;
  remoteServiceFunctionArgument?: object;
  responseUrl?: string;
  options?: SendToOptions;
}

export default async function sendToRemoteServiceInsideTransaction(sends: CallOrSendToSpec[]) {
  const foundRedisMessageBroker = sends.find((send) => send.communicationMethod !== 'kafka');
  if (foundRedisMessageBroker) {
    throw new Error('You can only use sendToRemoteServiceInsideTransaction with Kafka');
  }

  const sendsWithUrl = sends.map(
    ({
      communicationMethod,
      server,
      remoteMicroserviceName,
      remoteMicroserviceNamespace,
      remoteServiceFunctionName,
      remoteServiceFunctionArgument,
      sendResponseTo,
      options
    }) => ({
      remoteServiceFunctionUrl: `${communicationMethod}://${server}/${remoteMicroserviceName}.${remoteMicroserviceNamespace}/${remoteServiceFunctionName}`,
      remoteServiceFunctionArgument,
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
