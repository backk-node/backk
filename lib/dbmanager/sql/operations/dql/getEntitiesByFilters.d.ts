import SqlExpression from '../../expressions/SqlExpression';
import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PreHook } from '../../../hooks/PreHook';
import { EntitiesPostHook } from "../../../hooks/EntitiesPostHook";
export default function getEntitiesByFilters<T>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object, EntityClass: new () => T, options?: {
    preHooks?: PreHook | PreHook[];
    postQueryOperations?: PostQueryOperations;
    postHook?: EntitiesPostHook<T>;
}): PromiseErrorOr<T[]>;
