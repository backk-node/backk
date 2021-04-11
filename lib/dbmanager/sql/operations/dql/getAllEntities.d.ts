import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
export default function getAllEntities<T>(dbManager: AbstractSqlDbManager, EntityClass: new () => T, postQueryOperations?: PostQueryOperations): PromiseErrorOr<T[]>;
