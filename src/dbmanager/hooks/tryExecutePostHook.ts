import { PostHook } from './PostHook';
import { getNamespace } from 'cls-hooked';
import createErrorMessageWithStatusCode from '../../errors/createErrorMessageWithStatusCode';
import { HttpStatusCodes } from '../../constants/constants';
import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';

export default async function tryExecutePostHook<T extends BackkEntity | SubEntity>(
  postHook: PostHook<T>,
  entity: T | null | undefined
) {
  const clsNamespace = getNamespace('serviceFunctionExecution');
  clsNamespace?.set('isInsidePostHook', true);
  const postHookFunc =
    typeof postHook === 'function' ? postHook : postHook.shouldSucceedOrBeTrue;
  let hookCallResult;

  try {
    if (typeof postHook === 'object' && postHook.executePostHookIf) {
      if (postHook.executePostHookIf(entity ?? null)) {
        hookCallResult = await postHookFunc(entity ?? null);
      }
    } else {
      hookCallResult = await postHookFunc(entity ?? null);
    }
  } catch (error) {
    throw new Error(
      createErrorMessageWithStatusCode(error.errorMessage, HttpStatusCodes.INTERNAL_SERVER_ERROR)
    );
  }

  clsNamespace?.set('isInsidePostHook', false);

  if (Array.isArray(hookCallResult) && hookCallResult[1]) {
    throw hookCallResult[1];
  }

  if (hookCallResult === false) {
    let errorMessage = 'Post-hook evaluated to false without specific error message';

    let statusCode = HttpStatusCodes.BAD_REQUEST;
    if (typeof postHook === 'object' && postHook.error) {
      errorMessage = 'Error code ' + postHook.error.errorCode + ':' + postHook.error.message;
      statusCode = postHook.error?.statusCode ?? HttpStatusCodes.BAD_REQUEST;
    }

    throw new Error(createErrorMessageWithStatusCode(errorMessage, statusCode));
  }
}
