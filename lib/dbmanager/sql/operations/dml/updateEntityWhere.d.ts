import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { RecursivePartial } from "../../../../types/RecursivePartial";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PostHook } from "../../../hooks/PostHook";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
export default function updateEntityWhere<T extends BackkEntity>(dbManager: AbstractSqlDbManager, fieldPathName: string, fieldValue: any, entity: RecursivePartial<T>, EntityClass: new () => T, entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[], postHook?: PostHook<T>, postQueryOperations?: PostQueryOperations): PromiseErrorOr<null>;
