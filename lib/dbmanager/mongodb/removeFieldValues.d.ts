import { BackkEntity } from '../../types/entities/BackkEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import MongoDbManager from '../MongoDbManager';
import { MongoClient } from "mongodb";
export default function removeFieldValues<T extends BackkEntity>(client: MongoClient, dbManager: MongoDbManager, _id: string, fieldName: string, fieldValues: (string | number | boolean)[], EntityClass: new () => T, options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
}): PromiseErrorOr<null>;
