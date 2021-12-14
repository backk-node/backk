import { BackkEntity } from '../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { BackkError } from '../../types/BackkError';
import { Many, One } from "../DataStore";
import { ErrorDefinition } from "../../types/ErrorDefinition";

export type PreHook<> =
  | {
      executePreHookIf?: () => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
      shouldSucceedOrBeTrue: () =>
        | PromiseErrorOr<Many<BackkEntity> | One<BackkEntity> | null>
        | Promise<boolean | BackkError | null | undefined | void>
        | boolean;
      error?: ErrorDefinition;
    }
  | (() =>
      | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
      | Promise<boolean | BackkError | null | undefined | void>
      | boolean);
