import SqlExpression from "../../expressions/SqlExpression";
import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
export default function getEntitiesCount<T>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object | undefined, EntityClass: new () => T): PromiseErrorOr<number>;
