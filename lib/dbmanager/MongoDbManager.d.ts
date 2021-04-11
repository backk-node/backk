import { FilterQuery, MongoClient } from 'mongodb';
import SqlExpression from './sql/expressions/SqlExpression';
import AbstractDbManager, { Field } from './AbstractDbManager';
import { RecursivePartial } from '../types/RecursivePartial';
import { PreHook } from './hooks/PreHook';
import { BackkEntity } from '../types/entities/BackkEntity';
import { PostQueryOperations } from '../types/postqueryoperations/PostQueryOperations';
import UserDefinedFilter from '../types/userdefinedfilters/UserDefinedFilter';
import { SubEntity } from '../types/entities/SubEntity';
import MongoDbQuery from './mongodb/MongoDbQuery';
import { PostHook } from './hooks/PostHook';
import { PromiseErrorOr } from '../types/PromiseErrorOr';
import { EntityPreHook } from './hooks/EntityPreHook';
import { EntitiesPostHook } from './hooks/EntitiesPostHook';
export default class MongoDbManager extends AbstractDbManager {
    private readonly uri;
    readonly dbName: string;
    private mongoClient;
    constructor(uri: string, dbName: string);
    getClient(): MongoClient;
    getIdColumnType(): string;
    getTimestampType(): string;
    getVarCharType(): string;
    getBooleanType(): string;
    isDuplicateEntityError(): boolean;
    getModifyColumnStatement(): string;
    getFilters<T>(mongoDbFilters: Array<MongoDbQuery<T>> | FilterQuery<T> | Partial<T> | object): Array<MongoDbQuery<T> | SqlExpression> | Partial<T> | object;
    tryExecute<T>(shouldUseTransaction: boolean, executeDbOperations: (client: MongoClient) => Promise<T>): Promise<T>;
    tryExecuteSql<T>(): Promise<Field[]>;
    tryExecuteSqlWithoutCls<T>(): Promise<Field[]>;
    getDbManagerType(): string;
    getDbHost(): string;
    isDbReady(): Promise<boolean>;
    tryBeginTransaction(): Promise<void>;
    cleanupTransaction(): void;
    executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>;
    createEntity<T extends BackkEntity>(EntityClass: new () => T, entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>, options?: {
        preHooks?: PreHook | PreHook[];
        postHook?: PostHook<T>;
        postQueryOperations?: PostQueryOperations;
    }, isInternalCall?: boolean): PromiseErrorOr<T>;
    addSubEntityToEntityById<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntity: Omit<U, 'id'> | {
        _id: string;
    }, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    addSubEntityToEntityByFilters<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntity: Omit<U, 'id'> | {
        _id: string;
    }, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    addSubEntitiesToEntityById<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntities: Array<Omit<U, 'id'> | {
        _id: string;
    }>, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntities: Array<Omit<U, 'id'> | {
        _id: string;
    }>, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    getAllEntities<T>(EntityClass: new () => T, options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    getEntitiesByFilters<T>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: EntitiesPostHook<T>;
    }): PromiseErrorOr<T[]>;
    getEntityByFilters<T>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
        postHook?: PostHook<T>;
    }, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
    getEntityCount<T>(EntityClass: new () => T, filters?: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression> | Partial<T>): PromiseErrorOr<number>;
    getEntityById<T>(EntityClass: new () => T, _id: string, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
    }, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
    getEntitiesByIds<T>(EntityClass: {
        new (): T;
    }, _ids: string[], options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    getEntityByField<T>(EntityClass: new () => T, fieldPathName: string, fieldValue: any, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
    }, isSelectForUpdate?: boolean, isInternalCall?: boolean): PromiseErrorOr<T>;
    getEntitiesByField<T>(EntityClass: {
        new (): T;
    }, fieldPathName: string, fieldValue: any, options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    updateEntity<T extends BackkEntity>(EntityClass: new () => T, { _id, id, ...restOfEntity }: RecursivePartial<T> & {
        _id: string;
    }, options?: {
        preHooks?: PreHook | PreHook[];
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postHook?: PostHook<T>;
        postQueryOperations?: PostQueryOperations;
    }, isRecursiveCall?: boolean, isInternalCall?: boolean): PromiseErrorOr<null>;
    updateEntityByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, entityUpdate: Partial<T>, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    updateEntitiesByFilters<T extends object>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, entityUpdate: Partial<T>): PromiseErrorOr<null>;
    updateEntityByField<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, fieldPathName: string, fieldValue: any, entityUpdate: RecursivePartial<T>, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    deleteEntityById<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    deleteEntitiesByField<T extends object>(EntityClass: {
        new (): T;
    }, fieldName: keyof T & string, fieldValue: T[keyof T] | string): PromiseErrorOr<null>;
    deleteEntityByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    deleteEntitiesByFilters<T extends object>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object): PromiseErrorOr<null>;
    removeSubEntitiesByJsonPathFromEntityById<T extends BackkEntity>(subEntitiesJsonPath: string, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    removeSubEntityByIdFromEntityById<T extends BackkEntity>(subEntitiesJsonPath: string, subEntityId: string, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>;
    tryReleaseDbConnectionBackToPool(): void;
    tryReserveDbConnectionFromPool(): Promise<void>;
    shouldConvertTinyIntegersToBooleans(): boolean;
    deleteEntityByField<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, fieldName: keyof T & string, fieldValue: T[keyof T] | string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    removeSubEntitiesByJsonPathFromEntityByFilters<T extends BackkEntity, U extends object>(subEntitiesJsonPath: string, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    removeSubEntityByIdFromEntityByFilters<T extends BackkEntity>(subEntitiesJsonPath: string, subEntityId: string, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    addEntityArrayFieldValues<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, fieldName: keyof T & string, fieldValues: (string | number | boolean)[], options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    doesEntityArrayFieldContainValue<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, fieldName: keyof T & string, fieldValue: string | number | boolean): PromiseErrorOr<boolean>;
    removeEntityArrayFieldValues<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, fieldName: keyof T & string, fieldValues: (string | number | boolean)[], options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
}
