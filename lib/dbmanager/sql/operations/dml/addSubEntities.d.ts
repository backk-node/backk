import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { SubEntity } from "../../../../types/entities/SubEntity";
import { PostHook } from "../../../hooks/PostHook";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
export default function addSubEntities<T extends BackkEntity, U extends SubEntity>(dbManager: AbstractSqlDbManager, _id: string, subEntityPath: string, newSubEntities: Array<Omit<U, 'id'> | {
    _id: string;
}>, EntityClass: new () => T, options?: {
    ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
}): PromiseErrorOr<null>;
