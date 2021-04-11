import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { PostHook } from "../../../hooks/PostHook";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
export default function deleteEntityById<T extends BackkEntity>(dbManager: AbstractSqlDbManager, _id: string, EntityClass: new () => T, entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[], postHook?: PostHook<T>, postQueryOperations?: PostQueryOperations, isRecursive?: boolean): PromiseErrorOr<null>;
