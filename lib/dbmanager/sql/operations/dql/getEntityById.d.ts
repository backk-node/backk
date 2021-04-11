import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PostHook } from '../../../hooks/PostHook';
import { PreHook } from "../../../hooks/PreHook";
export default function getEntityById<T>(dbManager: AbstractSqlDbManager, _id: string, EntityClass: new () => T, options?: {
    preHooks?: PreHook | PreHook[];
    postQueryOperations?: PostQueryOperations;
    postHook?: PostHook<T>;
    ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
}, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
