import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import SqlExpression from '../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { EntityPreHook } from '../../../hooks/EntityPreHook';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PostHook } from '../../../hooks/PostHook';
export default function updateEntityByFilters<T extends BackkEntity>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, update: Partial<T>, EntityClass: new () => T, options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postQueryOperations?: PostQueryOperations;
    postHook?: PostHook<T>;
}): PromiseErrorOr<null>;
