import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import SqlExpression from "../../expressions/SqlExpression";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
export default function updateEntitiesByFilters<T extends BackkEntity>(dbManager: AbstractSqlDbManager, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, update: Partial<T>, EntityClass: new () => T): PromiseErrorOr<null>;
