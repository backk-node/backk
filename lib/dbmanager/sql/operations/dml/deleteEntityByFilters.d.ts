import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import SqlExpression from "../../expressions/SqlExpression";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PostHook } from "../../../hooks/PostHook";
export default function deleteEntityByFilters<T extends object>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object, EntityClass: new () => T, options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postQueryOperations?: PostQueryOperations;
    postHook?: PostHook<T>;
}): PromiseErrorOr<null>;
