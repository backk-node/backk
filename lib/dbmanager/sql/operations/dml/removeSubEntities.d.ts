import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PostHook } from "../../../hooks/PostHook";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
export default function removeSubEntities<T extends BackkEntity, U extends object>(dbManager: AbstractSqlDbManager, _id: string, subEntitiesJsonPath: string, EntityClass: new () => T, entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[], postHook?: PostHook<T>, postQueryOperations?: PostQueryOperations): PromiseErrorOr<null>;
