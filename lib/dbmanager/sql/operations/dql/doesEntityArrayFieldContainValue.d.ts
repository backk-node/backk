import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
export default function doesEntityArrayFieldContainValue<T extends BackkEntity>(dbManager: AbstractSqlDbManager, EntityClass: {
    new (): T;
}, _id: string, fieldName: keyof T & string, fieldValue: string | number | boolean): PromiseErrorOr<boolean>;
