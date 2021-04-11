import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import MongoDbManager from '../MongoDbManager';
import { MongoClient } from 'mongodb';
import MongoDbQuery from './MongoDbQuery';
import SqlExpression from '../sql/expressions/SqlExpression';
import UserDefinedFilter from '../../types/userdefinedfilters/UserDefinedFilter';
export default function addSimpleSubEntitiesOrValuesByFilters<T extends BackkEntity, U extends SubEntity>(client: MongoClient, dbManager: MongoDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, subEntityPath: string, newSubEntities: Array<Omit<U, 'id'> | {
    _id: string;
} | string | number | boolean>, EntityClass: new () => T, options?: {
    ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
}): PromiseErrorOr<null>;
