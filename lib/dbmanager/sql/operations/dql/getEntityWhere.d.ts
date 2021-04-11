import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PostHook } from '../../../hooks/PostHook';
import { PreHook } from "../../../hooks/PreHook";
export default function getEntityWhere<T>(dbManager: AbstractSqlDbManager, fieldPathName: string, fieldValue: any, EntityClass: new () => T, preHooks?: PreHook | PreHook[], postQueryOperations?: PostQueryOperations, postHook?: PostHook<T>, ifEntityNotFoundReturn?: () => PromiseErrorOr<T>, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
