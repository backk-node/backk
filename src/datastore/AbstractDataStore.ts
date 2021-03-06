import BaseService from "../services/BaseService";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__CronJobScheduling from "../scheduling/entities/__Backk__CronJobScheduling";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__JobScheduling from "../scheduling/entities/__Backk__JobScheduling";
import DbTableVersion from "../types/DbTableVersion";
import { getNamespace, Namespace } from "cls-hooked";
import { BackkEntity } from "../types/entities/BackkEntity";
import { PreHook } from "./hooks/PreHook";
import { PostQueryOperations } from "../types/postqueryoperations/PostQueryOperations";
import { PostHook } from "./hooks/PostHook";
import { PromiseErrorOr } from "../types/PromiseErrorOr";
import { ArrayFieldValue, DataStore, Field, Many, One, QueryFilters } from "./DataStore";
import MongoDbFilter from "./mongodb/MongoDbFilter";
import { FilterQuery, MongoClient } from "mongodb";
import SqlFilter from "./sql/filters/SqlFilter";
import { SubEntity } from "../types/entities/SubEntity";
import { EntityPreHook } from "./hooks/EntityPreHook";
import EntityCountRequest from "../types/EntityCountRequest";
import { EntitiesPostHook } from "./hooks/EntitiesPostHook";
import { RecursivePartial } from "../types/RecursivePartial";
import forEachAsyncParallel from "../utils/forEachAsyncParallel";

export default abstract class AbstractDataStore implements DataStore {
  private readonly services: BaseService[] = [];
  private readonly schema: string;
  private readonly dbName?: string;
  protected firstDbOperationFailureTimeInMillis = 0;

  constructor(schema: string, dbName?: string) {
    this.schema = schema.toLowerCase();
    this.dbName = dbName;
  }

  getSchema(): string {
    return this.schema;
  }

  getDbName(): string | undefined {
    return this.dbName;
  }

  addService(service: BaseService) {
    this.services.push(service);
  }

  getTypes(): Readonly<object> {
    return this.services.reduce((types, service) => ({ ...types, ...service.Types }), {
      // eslint-disable-next-line @typescript-eslint/camelcase
      __Backk__CronJobScheduling,
      // eslint-disable-next-line @typescript-eslint/camelcase
      __Backk__JobScheduling,
      DbTableVersion
    });
  }

  getType(Type: new () => any): new () => any {
    return (this.getTypes() as any)[Type.name] ?? Type;
  }

  getClsNamespace(): Namespace | undefined {
    return getNamespace('serviceFunctionExecution');
  }

  async createEntities<T extends BackkEntity>(
    EntityClass: { new (): T },
    entities: Array<Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<Many<T>> {
    return this.executeInsideTransaction(async () => {
      try {
        const createdEntities = await Promise.all(
          entities.map(async (entity, index) => {
            const [createdEntity, error] = await this.createEntity(EntityClass, entity, options);

            if (!createdEntity) {
              if (error) {
                error.message = 'Entity ' + index + ': ' + error.message;
              }
              throw error;
            }

            return createdEntity.data;
          })
        );

        return [
          { metadata: { currentPageTokens: undefined, entityCounts: undefined }, data: createdEntities },
          null
        ];
      } catch (error) {
        return [null, error];
      }
    });
  }

  deleteEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[]
  ): PromiseErrorOr<null> {
    return this.executeInsideTransaction(async () => {
      try {
        return await forEachAsyncParallel(_ids, async (_id, index) => {
          const [, error] = await this.deleteEntityById(EntityClass, _id);

          if (error) {
            error.message = 'Entity ' + index + ': ' + error.message;
            throw error;
          }
        });
      } catch (error) {
        return error;
      }
    });
  }

  abstract getClient(): any;
  abstract isDuplicateEntityError(error: Error): boolean;
  abstract getIdColumnType(): string;
  abstract getTimestampType(): string;
  abstract getVarCharType(maxLength: number): string;
  abstract getBooleanType(): string;
  abstract getDataStoreType(): string;
  abstract getDbHost(): string;
  abstract shouldConvertTinyIntegersToBooleans(): boolean;
  abstract getFilters<T>(
    mongoDbFilters: Array<MongoDbFilter<T>> | FilterQuery<T> | Partial<T> | object,
    sqlFilters: SqlFilter[] | SqlFilter | Partial<T> | object
  ): Array<MongoDbFilter<T> | SqlFilter> | Partial<T> | object;

  abstract getModifyColumnStatement(
    schema: string | undefined,
    tableName: string,
    columnName: string,
    columnType: string,
    isUnique: boolean
  ): string;

  abstract executeSqlOrThrow<T>(
    sqlStatement: string,
    values?: any[],
    shouldReportError?: boolean
  ): Promise<Field[]>;

  abstract executeSqlQueryOrThrow(sqlQueryStatement: string, values?: any[]): Promise<any>;

  abstract executeMongoDbOperationsOrThrow<T>(
    shouldUseTransaction: boolean,
    executeDbOperations: (client: MongoClient) => Promise<T>
  ): Promise<T>

  abstract tryExecuteSqlWithoutCls<T>(
    sqlStatement: string,
    values?: any[],
    shouldReportError?: boolean,
    shouldReportSuccess?: boolean
  ): Promise<Field[]>;

  abstract isDbReady(): Promise<boolean>;
  abstract getLastInitError(): Error | undefined;
  abstract tryReserveDbConnectionFromPool(): Promise<void>;
  abstract tryReleaseDbConnectionBackToPool(): void;
  abstract tryBeginTransaction(): Promise<void>;
  abstract cleanupTransaction(): void;
  abstract executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>;

  abstract createEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<One<T>>;

  abstract addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
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
  abstract addSubEntitiesToEntityById<T extends BackkEntity, U extends SubEntity>(
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

  abstract getAllEntities<T extends BackkEntity>(
    EntityClass: new () => T,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;

  abstract getEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: EntitiesPostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<Many<T>>;

  abstract getEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<One<T>>;

  abstract getEntityCount<T extends BackkEntity>(
    EntityClass: new () => T,
    filters?: QueryFilters<T>
  ): PromiseErrorOr<number>;

  abstract getEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<One<T>>;

  abstract getEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[],
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;

  abstract updateEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entityUpdate: RecursivePartial<T> & { _id: string },
    options?: {
      preHooks?: PreHook | PreHook[];
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract updateEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract updateEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>
  ): PromiseErrorOr<null>;

  abstract deleteEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract deleteEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract deleteEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>
  ): PromiseErrorOr<null>;

  abstract removeSubEntitiesFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract removeSubEntityFromEntityById<T extends BackkEntity>(
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

  abstract removeSubEntitiesFromEntityByFilters<T extends BackkEntity, U extends object>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract removeSubEntityFromEntityByFilters<T extends BackkEntity>(
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

  abstract deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>;

  abstract addArrayFieldValuesToEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValuesToAdd: ArrayFieldValue[],
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;

  abstract doesArrayFieldContainValueInEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValue: ArrayFieldValue,
    EntityClass: { new (): T },
    _id: string
  ): PromiseErrorOr<boolean>;

  abstract removeArrayFieldValuesFromEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValuesToRemove: ArrayFieldValue[],
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
