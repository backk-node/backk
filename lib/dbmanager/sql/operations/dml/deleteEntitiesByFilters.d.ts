import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import SqlExpression from "../../expressions/SqlExpression";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
export default function deleteEntitiesByFilters<T extends object>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object, EntityClass: new () => T): PromiseErrorOr<null>;
