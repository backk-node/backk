import { BackkEntity } from '../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { SubEntity } from '../../types/entities/SubEntity';
import { ErrorDef } from './PreHook';
import { One } from "../DataStore";

export type EntitiesPostHook<T extends BackkEntity | SubEntity> =
  | {
  executePostHookIf?: (entity: T[] | null) => boolean;
  shouldSucceedOrBeTrue: (
    entity: T[] | null
  ) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean;
  error?: ErrorDef;
}
  | ((entity: T[] | null) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean);
