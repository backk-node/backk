import { Namespace } from 'cls-hooked';
import SqlExpression from './sql/expressions/SqlExpression';
import { RecursivePartial } from '../types/RecursivePartial';
import { PreHook } from './hooks/PreHook';
import { BackkEntity } from '../types/entities/BackkEntity';
import { PostQueryOperations } from '../types/postqueryoperations/PostQueryOperations';
import UserDefinedFilter from '../types/userdefinedfilters/UserDefinedFilter';
import BaseService from '../service/BaseService';
import { SubEntity } from '../types/entities/SubEntity';
import MongoDbQuery from './mongodb/MongoDbQuery';
import { PostHook } from './hooks/PostHook';
import { FilterQuery } from 'mongodb';
import { PromiseErrorOr } from '../types/PromiseErrorOr';
import { EntityPreHook } from './hooks/EntityPreHook';
import { EntitiesPostHook } from './hooks/EntitiesPostHook';
export interface Field {
    name: string;
}
export default abstract class AbstractDbManager {
    private readonly services;
    readonly schema: string;
    readonly dbName?: string;
    protected firstDbOperationFailureTimeInMillis: number;
    constructor(schema: string);
    addService(service: BaseService): void;
    getTypes(): Readonly<object>;
    getType(Type: new () => any): new () => any;
    getClsNamespace(): Namespace | undefined;
    abstract getClient(): any;
    abstract isDuplicateEntityError(error: Error): boolean;
    abstract getIdColumnType(): string;
    abstract getTimestampType(): string;
    abstract getVarCharType(maxLength: number): string;
    abstract getBooleanType(): string;
    abstract getDbManagerType(): string;
    abstract getDbHost(): string;
    abstract shouldConvertTinyIntegersToBooleans(): boolean;
    abstract getFilters<T>(mongoDbFilters: Array<MongoDbQuery<T>> | FilterQuery<T> | Partial<T> | object, sqlFilters: SqlExpression[] | SqlExpression | Partial<T> | object): Array<MongoDbQuery<T> | SqlExpression> | Partial<T> | object;
    abstract getModifyColumnStatement(schema: string | undefined, tableName: string, columnName: string, columnType: string, isUnique: boolean): string;
    abstract tryExecuteSql<T>(sqlStatement: string, values?: any[], shouldReportError?: boolean): Promise<Field[]>;
    abstract tryExecuteSqlWithoutCls<T>(sqlStatement: string, values?: any[], shouldReportError?: boolean, shouldReportSuccess?: boolean): Promise<Field[]>;
    abstract isDbReady(): Promise<boolean>;
    abstract tryReserveDbConnectionFromPool(): Promise<void>;
    abstract tryReleaseDbConnectionBackToPool(): void;
    abstract tryBeginTransaction(): Promise<void>;
    abstract cleanupTransaction(): void;
    abstract executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>;
    abstract createEntity<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<T>;
    createEntities<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, entities: Array<Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>>, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<T[]>;
    abstract addSubEntityToEntityById<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntity: Omit<U, 'id'> | {
        _id: string;
    }, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract addSubEntityToEntityByFilters<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntity: Omit<U, 'id'> | {
        _id: string;
    }, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntities: Array<Omit<U, 'id'> | {
        _id: string;
    }>, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract addSubEntitiesToEntityById<T extends BackkEntity, U extends SubEntity>(subEntityPath: string, subEntities: Array<Omit<U, 'id'> | {
        _id: string;
    }>, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract getAllEntities<T extends BackkEntity>(EntityClass: new () => T, options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    abstract getEntitiesByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: EntitiesPostHook<T>;
    }): PromiseErrorOr<T[]>;
    abstract getEntityByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<T>;
    abstract getEntityCount<T extends BackkEntity>(EntityClass: new () => T, filters?: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object): PromiseErrorOr<number>;
    abstract getEntityById<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<T>;
    abstract getEntitiesByIds<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _ids: string[], options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    abstract updateEntity<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, entityUpdate: RecursivePartial<T> & {
        _id: string;
    }, options?: {
        preHooks?: PreHook | PreHook[];
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract updateEntityByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, entityUpdate: Partial<T>, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract updateEntitiesByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, entityUpdate: Partial<T>): PromiseErrorOr<null>;
    updateEntities<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, entityUpdates: Array<RecursivePartial<T> & {
        _id: string;
    }>): PromiseErrorOr<null>;
    abstract deleteEntityById<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    deleteEntitiesByIds<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _ids: string[]): PromiseErrorOr<null>;
    abstract deleteEntityByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract deleteEntitiesByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object): PromiseErrorOr<null>;
    abstract removeSubEntitiesByJsonPathFromEntityById<T extends BackkEntity>(subEntitiesJsonPath: string, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract removeSubEntityByIdFromEntityById<T extends BackkEntity>(subEntityPath: string, subEntityId: string, EntityClass: {
        new (): T;
    }, _id: string, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract removeSubEntitiesByJsonPathFromEntityByFilters<T extends BackkEntity, U extends object>(subEntitiesJsonPath: string, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract removeSubEntityByIdFromEntityByFilters<T extends BackkEntity>(subEntityPath: string, subEntityId: string, EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>;
    abstract addEntityArrayFieldValues<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, fieldName: keyof T & string, fieldValuesToAdd: (string | number | boolean)[], options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    abstract doesEntityArrayFieldContainValue<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, fieldName: keyof T & string, fieldValue: string | number | boolean): PromiseErrorOr<boolean>;
    abstract removeEntityArrayFieldValues<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, _id: string, fieldName: keyof T & string, fieldValuesToRemove: (string | number | boolean)[], options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
}
