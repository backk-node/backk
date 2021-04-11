import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { SubEntity } from "../../../../types/entities/SubEntity";
import { PostHook } from "../../../hooks/PostHook";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import SqlExpression from "../../expressions/SqlExpression";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
export default function addSubEntitiesByFilters<T extends BackkEntity, U extends SubEntity>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, subEntityPath: string, newSubEntities: Array<Omit<U, 'id'> | {
    _id: string;
}>, EntityClass: new () => T, options?: {
    ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
}): PromiseErrorOr<null>;
