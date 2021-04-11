import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { PostHook } from '../../../hooks/PostHook';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { EntityPreHook } from '../../../hooks/EntityPreHook';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import SqlExpression from '../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
export default function removeSubEntitiesByFilters<T extends BackkEntity, U extends object>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, subEntitiesJsonPath: string, EntityClass: new () => T, entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[], postHook?: PostHook<T>, postQueryOperations?: PostQueryOperations): PromiseErrorOr<null>;
