import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
export default function deleteEntitiesWhere<T extends object>(dbManager: AbstractSqlDbManager, fieldName: string, fieldValue: T[keyof T] | string, EntityClass: new () => T): PromiseErrorOr<null>;
