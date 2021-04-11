import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import MongoDbManager from '../MongoDbManager';
export default function removeSimpleSubEntityById<T extends BackkEntity, U extends SubEntity>(dbManager: MongoDbManager, _id: string, subEntityPath: string, subEntityId: string, EntityClass: new () => T, options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
}): PromiseErrorOr<null>;
