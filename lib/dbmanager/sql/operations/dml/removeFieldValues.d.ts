import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PostHook } from "../../../hooks/PostHook";
export default function removeFieldValues<T extends BackkEntity>(dbManager: AbstractSqlDbManager, _id: string, fieldName: string, fieldValues: (string | number | boolean)[], EntityClass: new () => T, options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postQueryOperations?: PostQueryOperations;
    postHook?: PostHook<T>;
}): PromiseErrorOr<null>;
