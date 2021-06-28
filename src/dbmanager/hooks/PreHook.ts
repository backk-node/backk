import { BackkEntity } from '../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { BackkError } from '../../types/BackkError';
import { Many, One } from "../AbstractDbManager";

export interface ErrorDef {
  errorCode: string;
  message: string;
  statusCode?: number;
}

export type PreHook<> =
  | {
      executePreHookIf?: () => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
      shouldSucceedOrBeTrue: () =>
        | PromiseErrorOr<Many<BackkEntity> | One<BackkEntity> | null>
        | Promise<boolean | BackkError | null | undefined | void>
        | boolean;
      error?: ErrorDef;
    }
  | (() =>
      | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
      | Promise<boolean | BackkError | null | undefined | void>
      | boolean);
