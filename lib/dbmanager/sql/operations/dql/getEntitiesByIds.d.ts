import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
export default function getEntitiesByIds<T>(dbManager: AbstractSqlDbManager, _ids: string[], EntityClass: new () => T, postQueryOperations?: PostQueryOperations): PromiseErrorOr<T[]>;
