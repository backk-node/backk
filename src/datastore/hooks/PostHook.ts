import { BackkEntity } from '../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { SubEntity } from '../../types/entities/SubEntity';
import { One } from "../DataStore";
import { BackkError } from "../../types/BackkError";

export type PostHook<T extends BackkEntity | SubEntity> =
  | {
      executePostHookIf?: (entity: T | null) => boolean;
      shouldSucceedOrBeTrue: (
        entity: T | null
      ) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean;
      error?: BackkError;
    }
  | ((entity: T | null) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean);
