import { CompressionTypes } from "kafkajs";
import { getNamespace } from "cls-hooked";
import { ResponseDestination, Transmission } from "./sendToRemoteServiceInsideTransaction";
import sendOneOrMoreToKafka, { SendAcknowledgementType } from "./kafka/sendOneOrMoreToKafka";
import sendOneOrMoreToRedis from "./redis/sendOneOrMoreToRedis";
import { validateServiceFunctionArguments } from "../utils/validateServiceFunctionArguments";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import getKafkaServerFromEnv from "./kafka/getKafkaServerFromEnv";
import getRedisServerFromEnv from "./redis/getRedisServerFromEnv";

export interface SendOptions {
  compressionType?: CompressionTypes;
  sendAcknowledgementType?: SendAcknowledgementType;
}

export type CommunicationMethod = 'http' | 'kafka' | 'redis';

export async function sendOneOrMore(
  sends: Transmission[],
  isTransactional: boolean
): PromiseErrorOr<null> {
  const clsNamespace = getNamespace('serviceFunctionExecution');

  if (clsNamespace?.get('isInsidePostHook')) {
    clsNamespace?.set(
      'postHookRemoteServiceCallCount',
      clsNamespace?.get('postHookRemoteServiceCallCount') + 1
    );
  } else {
    clsNamespace?.set('remoteServiceCallCount', clsNamespace?.get('remoteServiceCallCount') + 1);
  }

  const sendsWithUrl = sends.map(
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
      serviceFunctionUrl: `${communicationMethod}://${server}/${microserviceName}.${microserviceNamespace}/${serviceFunctionName}`,
      serviceFunctionArgument,
      responseDestination,
      options
    })
  );

  if (process.env.NODE_ENV === 'development') {
    await validateServiceFunctionArguments(sendsWithUrl);
  }

  if (sends[0].communicationMethod === 'kafka') {
    return sendOneOrMoreToKafka(sendsWithUrl, isTransactional);
  } else if (sends[0].communicationMethod === 'redis') {
    return sendOneOrMoreToRedis(sendsWithUrl, isTransactional);
  } else {
    throw new Error('Unsupported communication method: ' + sends[0].communicationMethod);
  }
}

export default async function sendToRemoteService(
  communicationMethod: 'kafka' | 'redis',
  microserviceName: string,
  serviceFunctionName: string,
  serviceFunctionArgument: object,
  microserviceNamespace = process.env.MICROSERVICE_NAMESPACE,
  server?: string,
  responseDestination?: ResponseDestination,
  options?: SendOptions
): PromiseErrorOr<null> {
  let finalServer = server;

  if (!finalServer) {
    if (communicationMethod === 'kafka') {
      finalServer = getKafkaServerFromEnv();
    } else {
      finalServer = getRedisServerFromEnv();
    }
  }
  return sendOneOrMore(
    [
      {
        communicationMethod,
        microserviceName,
        microserviceNamespace,
        serviceFunctionName,
        serviceFunctionArgument,
        server: finalServer,
        responseDestination,
        options
      }
    ],
    false
  );
}
