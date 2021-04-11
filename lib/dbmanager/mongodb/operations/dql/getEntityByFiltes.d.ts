import MongoDbQuery from '../../MongoDbQuery';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import SqlExpression from '../../../sql/expressions/SqlExpression';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import MongoDbManager from '../../../MongoDbManager';
import { PreHook } from '../../../hooks/PreHook';
import { PostHook } from '../../../hooks/PostHook';
export default function getEntityByFilters<T>(dbManager: MongoDbManager, filters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression> | Partial<T> | object, EntityClass: new () => T, options?: {
    preHooks?: PreHook | PreHook[];
    postQueryOperations?: PostQueryOperations;
    ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
    postHook?: PostHook<T>;
}, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
