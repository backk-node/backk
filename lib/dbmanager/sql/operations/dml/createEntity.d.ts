import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PostHook } from "../../../hooks/PostHook";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { SubEntity } from "../../../../types/entities/SubEntity";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { PreHook } from "../../../hooks/PreHook";
export default function createEntity<T extends BackkEntity | SubEntity>(dbManager: AbstractSqlDbManager, entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>, EntityClass: new () => T, preHooks?: PreHook | PreHook[], postHook?: PostHook<T>, postQueryOperations?: PostQueryOperations, isRecursiveCall?: boolean, shouldReturnItem?: boolean): PromiseErrorOr<T>;
