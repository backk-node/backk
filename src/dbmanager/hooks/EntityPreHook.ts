import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { BackkError } from '../../types/BackkError';

export interface ErrorDef {
  errorCode: string;
  message: string;
  statusCode?: number;
}

export type EntityPreHook<T extends BackkEntity | SubEntity> =
  | {
  executePreHookIf?: (entity: T) => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
  shouldSucceedOrBeTrue: (entity: T) =>
    | PromiseErrorOr<BackkEntity | BackkEntity[] | null>
    | Promise<boolean | BackkError | null | undefined>
    | boolean;
  error?: ErrorDef;
}
  | ((entity: T) =>
  | PromiseErrorOr<boolean | BackkEntity[] | BackkEntity | null>
  | Promise<boolean | BackkError | null | undefined>
  | boolean);
