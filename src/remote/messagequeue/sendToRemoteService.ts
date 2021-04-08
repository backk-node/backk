import { CompressionTypes } from 'kafkajs';
import { BackkError } from '../../types/BackkError';
import { getNamespace } from 'cls-hooked';
import { CallOrSendTo } from './sendToRemoteServiceInsideTransaction';
import sendOneOrMoreToKafka, { SendAcknowledgementType } from './kafka/sendOneOrMoreToKafka';
import sendOneOrMoreToRedis from './redis/sendOneOrMoreToRedis';
import parseRemoteServiceFunctionCallUrlParts from '../utils/parseRemoteServiceFunctionCallUrlParts';
import { validateServiceFunctionArguments } from '../utils/validateServiceFunctionArguments';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';

export interface SendToOptions {
  compressionType?: CompressionTypes;
  sendAcknowledgementType?: SendAcknowledgementType;
}

export async function sendOneOrMore(sends: CallOrSendTo[], isTransactional: boolean): PromiseErrorOr<null> {
  const clsNamespace = getNamespace('serviceFunctionExecution');

  if (clsNamespace?.get('isInsidePostHook')) {
    clsNamespace?.set(
      'postHookRemoteServiceCallCount',
      clsNamespace?.get('postHookRemoteServiceCallCount') + 1
    );
  } else {
    clsNamespace?.set('remoteServiceCallCount', clsNamespace?.get('remoteServiceCallCount') + 1);
  }

  if (process.env.NODE_ENV === 'development') {
    await validateServiceFunctionArguments(sends);
  }

  const { scheme } = parseRemoteServiceFunctionCallUrlParts(sends[0].remoteServiceFunctionUrl);

  if (scheme === 'kafka') {
    return sendOneOrMoreToKafka(sends, isTransactional);
  } else if (scheme === 'redis') {
    return sendOneOrMoreToRedis(sends, isTransactional);
  } else {
    throw new Error('Only URL schemes kafka:// and redis:// are supported');
  }
}

export default async function sendToRemoteService(
  remoteServiceFunctionUrl: string,
  serviceFunctionArgument: object,
  responseUrl?: string,
  options?: SendToOptions
): PromiseErrorOr<null> {
  return sendOneOrMore(
    [
      {
        remoteServiceFunctionUrl,
        serviceFunctionArgument,
        responseUrl,
        options
      }
    ],
    false
  );
}
