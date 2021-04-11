import MongoDbQuery from "../../MongoDbQuery";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import SqlExpression from "../../../sql/expressions/SqlExpression";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import MongoDbManager from "../../../MongoDbManager";
import { PreHook } from "../../../hooks/PreHook";
import { EntitiesPostHook } from "../../../hooks/EntitiesPostHook";
export default function getEntitiesByFilters<T>(dbManager: MongoDbManager, filters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression> | Partial<T> | object, EntityClass: new () => T, options?: {
    preHooks?: PreHook | PreHook[];
    postQueryOperations?: PostQueryOperations;
    postHook?: EntitiesPostHook<T>;
}, isRecursive?: boolean, isInternalCall?: boolean): PromiseErrorOr<T[]>;
