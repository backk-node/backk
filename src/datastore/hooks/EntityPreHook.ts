import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { BackkError } from '../../types/BackkError';
import { Many, One } from "../DataStore";
import { ErrorDefinition } from "../../types/ErrorDefinition";

export type EntityPreHook<T extends BackkEntity | SubEntity> =
  | {
  executePreHookIf?: (entity: T) => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
  shouldSucceedOrBeTrue: (entity: T) =>
    | PromiseErrorOr<One<BackkEntity> | Many<BackkEntity> | null>
    | Promise<boolean | BackkError | null | undefined>
    | boolean;
  error?: ErrorDefinition;
}
  | ((entity: T) =>
  | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
  | Promise<boolean | BackkError | null | undefined>
  | boolean);
