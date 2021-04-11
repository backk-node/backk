import SqlExpression from '../../expressions/SqlExpression';
import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PreHook } from '../../../hooks/PreHook';
import { PostHook } from '../../../hooks/PostHook';
export default function getEntityByFilters<T>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object, EntityClass: new () => T, options?: {
    preHooks?: PreHook | PreHook[];
    postQueryOperations?: PostQueryOperations;
    ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
    postHook?: PostHook<T>;
}, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
