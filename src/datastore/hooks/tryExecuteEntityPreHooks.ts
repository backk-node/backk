import forEachAsyncSequential from '../../utils/forEachAsyncSequential';
import createErrorMessageWithStatusCode from '../../errors/createErrorMessageWithStatusCode';
import { HttpStatusCodes } from '../../constants/constants';
import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from './EntityPreHook';
import { One } from '../DataStore';
import { getNamespace } from 'cls-hooked';

export default async function tryExecuteEntityPreHooks<T extends BackkEntity | SubEntity>(
  preHooks: EntityPreHook<T> | EntityPreHook<T>[],
  entity: One<T>
) {
  const clsNamespace = getNamespace('serviceFunctionExecution');
  const userAccountId = clsNamespace?.get('userAccountId');
  clsNamespace?.set('userAccountId', undefined);

  try {
    await forEachAsyncSequential(
      Array.isArray(preHooks) ? preHooks : [preHooks],
      async (preHook: EntityPreHook<T>) => {
        const hookFunc = typeof preHook === 'function' ? preHook : preHook.shouldSucceedOrBeTrue;
        let hookCallResult;

        try {
          if (typeof preHook === 'object' && preHook.executePreHookIf) {
            const shouldExecuteResult = await preHook.executePreHookIf(entity.data);

            if (typeof shouldExecuteResult === 'object' && shouldExecuteResult[1]) {
              throw shouldExecuteResult[1];
            }

            if (
              shouldExecuteResult === true ||
              (typeof shouldExecuteResult === 'object' && shouldExecuteResult[0])
            ) {
              hookCallResult = await hookFunc(entity.data);
            }
          } else {
            hookCallResult = await hookFunc(entity.data);
          }
        } catch (error) {
          throw new Error(
            createErrorMessageWithStatusCode(error.errorMessage, HttpStatusCodes.INTERNAL_SERVER_ERROR)
          );
        }

        if (
          (Array.isArray(hookCallResult) && hookCallResult[1]) ||
          hookCallResult === false ||
          (typeof hookCallResult === 'object' && !Array.isArray(hookCallResult) && hookCallResult !== null)
        ) {
          let errorMessage = 'Pre-hook evaluated to false without specific error message';

          if (typeof preHook === 'object' && preHook.error) {
            errorMessage = 'Error code ' + preHook.error.errorCode + ':' + preHook.error.message;
          }

          throw new Error(
            createErrorMessageWithStatusCode(
              errorMessage,
              typeof preHook === 'object'
                ? preHook.error?.statusCode ?? HttpStatusCodes.BAD_REQUEST
                : HttpStatusCodes.BAD_REQUEST
            )
          );
        }
      }
    );
  } finally {
    clsNamespace?.set('userAccountId', userAccountId);
  }
}
