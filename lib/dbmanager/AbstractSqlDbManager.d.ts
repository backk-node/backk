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
export default abstract class AbstractSqlDbManager extends AbstractDbManager {
    getClient(): any;
    cleanupTransaction(): void;
    abstract getDbHost(): string;
    abstract getPool(): any;
    abstract getConnection(): Promise<any>;
    abstract releaseConnection(connection: any): void;
    abstract getResultRows(result: any): any[];
    abstract getAffectedRows(result: any): number;
    abstract getResultFields(result: any): any[];
    abstract getValuePlaceholder(index: number): string;
    abstract getReturningIdClause(idFieldName: string): string;
    abstract getBeginTransactionStatement(): string;
    abstract getInsertId(result: any, idFieldName: string): number;
    abstract getIdColumnCastType(): string;
    abstract getUpdateForClause(tableAlias: string): string;
    abstract castAsBigint(columnName: string): string;
    abstract executeSql(connection: any, sqlStatement: string, values?: any[]): Promise<any>;
    abstract executeSqlWithNamedPlaceholders(connection: any, sqlStatement: string, values: object): Promise<any>;
    getFilters<T>(mongoDbFilters: Array<MongoDbQuery<T>> | Partial<T> | object, sqlFilters: SqlExpression[] | SqlExpression | Partial<T> | object): Array<MongoDbQuery<T> | SqlExpression> | Partial<T> | object;
    isDbReady(): Promise<boolean>;
    tryReserveDbConnectionFromPool(): Promise<void>;
    tryReleaseDbConnectionBackToPool(): void;
    tryBeginTransaction(): Promise<void>;
    tryCommitTransaction(): Promise<void>;
    tryRollbackTransaction(): Promise<void>;
    tryExecuteSql<T>(sqlStatement: string, values?: any[], shouldReportError?: boolean): Promise<Field[]>;
    tryExecuteSqlWithoutCls<T>(sqlStatement: string, values?: any[], shouldReportError?: boolean, shouldReportSuccess?: boolean): Promise<Field[]>;
    tryExecuteQuery(sqlStatement: string, values?: any[]): Promise<any>;
    tryExecuteQueryWithNamedParameters(sqlStatement: string, values: object): Promise<any>;
    executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>;
    createEntity<T extends BackkEntity | SubEntity>(entityClass: new () => T, entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>, options?: {
        preHooks?: PreHook | PreHook[];
        postHook?: PostHook<T>;
        postQueryOperations?: PostQueryOperations;
    }, shouldReturnItem?: boolean): PromiseErrorOr<T>;
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
    getAllEntities<T>(entityClass: new () => T, options?: {
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
    }): PromiseErrorOr<T>;
    getEntityCount<T>(entityClass: new () => T, filters?: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object): PromiseErrorOr<number>;
    getEntityById<T>(EntityClass: {
        new (): T;
    }, _id: string, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<T>;
    getEntitiesByIds<T>(EntityClass: {
        new (): T;
    }, _ids: string[], options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    getEntityByField<T>(entityClass: new () => T, fieldPathName: string, fieldValue: any, options?: {
        preHooks?: PreHook | PreHook[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
        ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
    }, isSelectForUpdate?: boolean): PromiseErrorOr<T>;
    getEntitiesByField<T>(EntityClass: {
        new (): T;
    }, fieldPathName: string, fieldValue: any, options?: {
        postQueryOperations?: PostQueryOperations;
    }): PromiseErrorOr<T[]>;
    updateEntity<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, entityUpdate: RecursivePartial<T> & {
        _id: string;
    }, options?: {
        preHooks?: PreHook | PreHook[];
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    updateEntityByFilters<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object, entityUpdate: Partial<T>, options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
    updateEntitiesByFilters<T extends BackkEntity>(EntityClass: {
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
    deleteEntityByField<T extends BackkEntity>(EntityClass: {
        new (): T;
    }, fieldName: keyof T & string, fieldValue: T[keyof T], options?: {
        entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
        postQueryOperations?: PostQueryOperations;
        postHook?: PostHook<T>;
    }): PromiseErrorOr<null>;
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
    removeSubEntitiesByJsonPathFromEntityByFilters<T extends BackkEntity>(subEntitiesJsonPath: string, EntityClass: {
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
    deleteAllEntities<T>(entityClass: new () => T): PromiseErrorOr<null>;
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
