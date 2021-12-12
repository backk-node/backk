/* eslint-disable @typescript-eslint/camelcase */
import SqlFilter from "./sql/filters/SqlFilter";
import { RecursivePartial } from "../types/RecursivePartial";
import { PreHook } from "./hooks/PreHook";
import { BackkEntity } from "../types/entities/BackkEntity";
import { PostQueryOperations } from "../types/postqueryoperations/PostQueryOperations";
import UserDefinedFilter from "../types/userdefinedfilters/UserDefinedFilter";
import { SubEntity } from "../types/entities/SubEntity";
import MongoDbFilter from "./mongodb/MongoDbFilter";
import { PostHook } from "./hooks/PostHook";
import { PromiseErrorOr } from "../types/PromiseErrorOr";
import { EntityPreHook } from "./hooks/EntityPreHook";
import { EntitiesPostHook } from "./hooks/EntitiesPostHook";
import CurrentPageToken from "../types/postqueryoperations/CurrentPageToken";
import EntityCountRequest from "../types/EntityCountRequest";
import { FilterQuery } from "mongodb";
import BaseService from "../services/BaseService";
import { Namespace } from "cls-hooked";

export interface Field {
  name: string;
}

export type Many<T> = {
  metadata: {
    currentPageTokens: CurrentPageToken[] | undefined;
    [key: string]: any;
  };
  data: T[];
};

export type One<T> = {
  metadata: {
    currentPageTokens: CurrentPageToken[] | undefined;
    [key: string]: any;
  };
  data: T;
};

export type ArrayFieldValue = string | number | boolean;

export type CommonEqFilters<T> = Partial<T> | object;
export type QueryFilters<T> = CommonEqFilters<T> | Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter>;

export interface DataStore {
  getDbName(): string | undefined;
  getSchema(): string;
  addService(service: BaseService): void;
  getTypes(): Readonly<object>;
  getType(Type: new () => any): new () => any;
  getClsNamespace(): Namespace | undefined;
  getClient(): any;
  isDuplicateEntityError(error: Error): boolean;
  getIdColumnType(): string;
  getTimestampType(): string;
  getVarCharType(maxLength: number): string;
  getBooleanType(): string;
  getDataStoreType(): string;
  getDbHost(): string;
  shouldConvertTinyIntegersToBooleans(): boolean;
  getFilters<T>(
    mongoDbFilters: Array<MongoDbFilter<T>> | FilterQuery<T> | Partial<T> | object,
    sqlFilters: SqlFilter[] | SqlFilter | Partial<T> | object
  ): Array<MongoDbFilter<T> | SqlFilter> | Partial<T> | object;

  getModifyColumnStatement(
    schema: string | undefined,
    tableName: string,
    columnName: string,
    columnType: string,
    isUnique: boolean
  ): string;

  tryExecuteSql<T>(
    sqlStatement: string,
    values?: any[],
    shouldReportError?: boolean
  ): Promise<Field[]>;

  tryExecuteSqlWithoutCls<T>(
    sqlStatement: string,
    values?: any[],
    shouldReportError?: boolean,
    shouldReportSuccess?: boolean
  ): Promise<Field[]>;

  isDbReady(): Promise<boolean>;
  tryReserveDbConnectionFromPool(): Promise<void>;
  tryReleaseDbConnectionBackToPool(): void;
  tryBeginTransaction(): Promise<void>;
  cleanupTransaction(): void;
  executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>;

  createEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<One<T>>;

  createEntities<T extends BackkEntity>(
    EntityClass: { new (): T },
    entities: Array<Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<Many<T>>;

  addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntities: Array<Omit<U, 'id'> | { _id: string }>,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  // noinspection OverlyComplexFunctionJS
  addSubEntitiesToEntityById<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntities: Array<Omit<U, 'id'> | { _id: string }>,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  getAllEntities<T extends BackkEntity>(
    EntityClass: new () => T,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;

  getEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: EntitiesPostHook<T>;
      entityCountRequests?: EntityCountRequest[]
    }
  ): PromiseErrorOr<Many<T>>;

  getEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[]
    }
  ): PromiseErrorOr<One<T>>;

  getEntityCount<T extends BackkEntity>(
    EntityClass: new () => T,
    filters?: QueryFilters<T>
  ): PromiseErrorOr<number>;

  getEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[]
    }
  ): PromiseErrorOr<One<T>>;

  getEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[],
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;

  updateEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entityUpdate: RecursivePartial<T> & { _id: string },
    options?: {
      preHooks?: PreHook | PreHook[];
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  updateEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  updateEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | Partial<T> | object,
    entityUpdate: RecursivePartial<T>
  ): PromiseErrorOr<null>;

  deleteEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  deleteEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[]
  ): PromiseErrorOr<null>;

  deleteEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  deleteEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<null>;

  removeSubEntitiesFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  removeSubEntityFromEntityById<T extends BackkEntity>(
    subEntityPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  removeSubEntitiesFromEntityByFilters<T extends BackkEntity, U extends object>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  removeSubEntityFromEntityByFilters<T extends BackkEntity>(
    subEntityPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>;

  addArrayFieldValuesToEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValuesToAdd: ArrayFieldValue[],
    EntityClass: { new(): T },
    _id: string,
    options?: { entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[]; postQueryOperations?: PostQueryOperations; postHook?: PostHook<T> }
  ): PromiseErrorOr<null>;

  doesArrayFieldContainValueInEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValue: ArrayFieldValue,
    EntityClass: { new(): T },
    _id: string
  ): PromiseErrorOr<boolean>;

  removeArrayFieldValuesFromEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValuesToRemove: ArrayFieldValue[],
    EntityClass: { new(): T },
    _id: string,
    options?: { entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[]; postQueryOperations?: PostQueryOperations; postHook?: PostHook<T> }
  ): PromiseErrorOr<null>;
}
