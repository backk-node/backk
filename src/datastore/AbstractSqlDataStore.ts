import SqlFilter from './sql/filters/SqlFilter';
import { DataStore, Field, Many, One, QueryFilters } from './DataStore';
import createEntity from './sql/operations/dml/createEntity';
import getEntitiesByFilters from './sql/operations/dql/getEntitiesByFilters';
import getEntitiesCount from './sql/operations/dql/getEntitiesCount';
import getEntityById from './sql/operations/dql/getEntityById';
import updateEntity from './sql/operations/dml/updateEntity';
import deleteEntityById from './sql/operations/dml/deleteEntityById';
import removeSubEntities from './sql/operations/dml/removeSubEntities';
import deleteAllEntities from './sql/operations/dml/deleteAllEntities';
import getEntitiesByIds from './sql/operations/dql/getEntitiesByIds';
import { RecursivePartial } from '../types/RecursivePartial';
import { PreHook } from './hooks/PreHook';
import { BackkEntity } from '../types/entities/BackkEntity';
import { PostQueryOperations } from '../types/postqueryoperations/PostQueryOperations';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import createBackkErrorFromError from '../errors/createBackkErrorFromError';
import log, { Severity } from '../observability/logging/log';
import addSubEntities from './sql/operations/dml/addSubEntities';
import startDbOperation from './utils/startDbOperation';
import recordDbOperationDuration from './utils/recordDbOperationDuration';
import { getNamespace } from 'cls-hooked';
import UserDefinedFilter from '../types/userdefinedfilters/UserDefinedFilter';
import getAllEntities from './sql/operations/dql/getAllEntities';
import { SubEntity } from '../types/entities/SubEntity';
import deleteEntitiesByFilters from './sql/operations/dml/deleteEntitiesByFilters';
import MongoDbFilter from './mongodb/MongoDbFilter';
import { PostHook } from './hooks/PostHook';
import { PromiseErrorOr } from '../types/PromiseErrorOr';
import updateEntitiesByFilters from './sql/operations/dml/updateEntitiesByFilters';
import { EntityPreHook } from './hooks/EntityPreHook';
import removeSubEntitiesByFilters from './sql/operations/dml/removeSubEntitiesByFilters';
import addFieldValues from './sql/operations/dml/addFieldValues';
import removeFieldValues from './sql/operations/dml/removeFieldValues';
import addSubEntitiesByFilters from './sql/operations/dml/addSubEntitiesByFilters';
import { EntitiesPostHook } from './hooks/EntitiesPostHook';
import getEntityByFilters from './sql/operations/dql/getEntityByFilters';
import deleteEntityByFilters from './sql/operations/dml/deleteEntityByFilters';
import updateEntityByFilters from './sql/operations/dml/updateEntityByFilters';
import doesEntityArrayFieldContainValue from './sql/operations/dql/doesEntityArrayFieldContainValue';
import EntityCountRequest from '../types/EntityCountRequest';
import AbstractDataStore from './AbstractDataStore';
import assertThatPostQueryOperationsAreValid from "../assertions/assertThatPostQueryOperationsAreValid";

export default abstract class AbstractSqlDataStore extends AbstractDataStore {
  protected lastInitError: Error | undefined = undefined;

  getClient(): any {
    return undefined;
  }

  cleanupTransaction() {
    // No operation
  }

  getLastInitError(): Error | undefined {
    return this.lastInitError;
  }

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

  abstract executeSqlWithNamedPlaceholders(
    connection: any,
    sqlStatement: string,
    values: object
  ): Promise<any>;

  getFilters<T>(
    mongoDbFilters: Array<MongoDbFilter<T>> | Partial<T> | object,
    sqlFilters: SqlFilter[] | SqlFilter | Partial<T> | object
  ): Array<MongoDbFilter<T> | SqlFilter> | Partial<T> | object {
    return sqlFilters instanceof SqlFilter ? [sqlFilters] : sqlFilters;
  }

  async isDbReady(): Promise<boolean> {
    try {
      await this.tryExecuteSqlWithoutCls(
        `SELECT * FROM ${this.getSchema().toLowerCase()}.__backk_db_initialization`,
        undefined,
        false
      );

      return true;
    } catch {
      try {
        const createTableStatement = `CREATE TABLE IF NOT EXISTS ${this.getSchema().toLowerCase()}.__backk_db_initialization (microserviceversion VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE, isinitialized SMALLINT, createdattimestamp ${this.getTimestampType()})`;
        await this.tryExecuteSqlWithoutCls(createTableStatement);
        return true;
      } catch(error) {
        this.lastInitError = error;
        return false;
      }
    }
  }

  async tryReserveDbConnectionFromPool(): Promise<void> {
    if (getNamespace('multipleServiceFunctionExecutions')?.get('connection')) {
      return;
    }

    log(Severity.DEBUG, 'Acquire database connection', '');

    try {
      const connection = await this.getConnection();
      this.getClsNamespace()?.set('connection', connection);
      this.getClsNamespace()?.set('localTransaction', false);
      this.getClsNamespace()?.set('globalTransaction', false);
      if (this.firstDbOperationFailureTimeInMillis) {
        this.firstDbOperationFailureTimeInMillis = 0;
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDataStoreType(), this.getDbHost(), 0);
      }
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDataStoreType(),
          this.getDbHost(),
          failureDurationInSecs
        );
      }

      log(Severity.ERROR, error.message, error.stack ?? '', {
        function: `${this.constructor.name}.tryReserveDbConnectionFromPool`
      });

      throw error;
    }
  }

  tryReleaseDbConnectionBackToPool() {
    if (getNamespace('multipleServiceFunctionExecutions')?.get('connection')) {
      return;
    }

    log(Severity.DEBUG, 'Release database connection', '');

    try {
      this.releaseConnection(this.getClsNamespace()?.get('connection'));
    } catch (error) {
      log(Severity.ERROR, error.message, error.stack ?? '', {
        function: `${this.constructor.name}.tryReleaseDbConnectionBackToPool`
      });
      throw error;
    }

    this.getClsNamespace()?.set('connection', null);
  }

  async tryBeginTransaction(): Promise<void> {
    log(Severity.DEBUG, 'Begin database transaction', '');

    try {
      await this.getClsNamespace()
        ?.get('connection')
        .query(this.getBeginTransactionStatement());
      if (this.firstDbOperationFailureTimeInMillis) {
        this.firstDbOperationFailureTimeInMillis = 0;
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDataStoreType(), this.getDbHost(), 0);
      }
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDataStoreType(),
          this.getDbHost(),
          failureDurationInSecs
        );
      }

      log(Severity.ERROR, error.message, error.stack ?? '', {
        function: `${this.constructor.name}.tryBeginTransaction`,
        sqlStatement: 'BEGIN'
      });

      throw error;
    }
  }

  async tryCommitTransaction(): Promise<void> {
    log(Severity.DEBUG, 'Commit database transaction', '');

    try {
      await this.getClsNamespace()
        ?.get('connection')
        .query('COMMIT');
    } catch (error) {
      log(Severity.ERROR, error.message, error.stack ?? '', {
        function: `${this.constructor.name}.tryCommitTransaction`,
        sqlStatement: 'COMMIT'
      });

      throw error;
    }
  }

  async tryRollbackTransaction(): Promise<void> {
    log(Severity.DEBUG, 'Rollback database transaction', '');

    try {
      await this.getClsNamespace()
        ?.get('connection')
        .query('ROLLBACK');
    } catch (error) {
      log(Severity.ERROR, error.message, error.stack ?? '', {
        function: `${this.constructor.name}.tryRollbackTransaction`,
        sqlStatement: 'ROLLBACK'
      });
    }
  }

  async tryExecuteSql<T>(sqlStatement: string, values?: any[], shouldReportError = true): Promise<Field[]> {
    if (this.getClsNamespace()?.get('remoteServiceCallCount') > 0) {
      this.getClsNamespace()?.set('dataStoreOperationAfterRemoteServiceCall', true);
    }

    log(Severity.DEBUG, 'Database DML operation', sqlStatement);

    try {
      const result = await this.executeSql(this.getClsNamespace()?.get('connection'), sqlStatement, values);
      return this.getResultFields(result);
    } catch (error) {
      if (shouldReportError && !this.isDuplicateEntityError(error)) {
        defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDataStoreType(), this.getDbHost());

        log(Severity.ERROR, error.message, error.stack ?? '', {
          sqlStatement,
          function: `${this.constructor.name}.tryExecuteSql`
        });
      }

      throw error;
    }
  }

  async tryExecuteSqlWithoutCls<T>(
    sqlStatement: string,
    values?: any[],
    shouldReportError = true,
    shouldReportSuccess = true
  ): Promise<Field[]> {
    log(Severity.DEBUG, 'Database DDL operation', sqlStatement);

    try {
      const result = await this.getPool().query(sqlStatement, values);

      if (shouldReportSuccess && (sqlStatement.startsWith('CREATE') || sqlStatement.startsWith('ALTER'))) {
        log(Severity.INFO, 'Database initialization operation', '', {
          sqlStatement,
          function: `${this.constructor.name}.tryExecuteSqlWithoutCls`
        });
      }

      return this.getResultFields(result);
    } catch (error) {
      if (shouldReportError && !this.isDuplicateEntityError(error)) {
        defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDataStoreType(), this.getDbHost());

        log(Severity.ERROR, error.message, error.stack ?? '', {
          sqlStatement,
          function: `${this.constructor.name}.tryExecuteSqlWithoutCls`
        });
      }

      throw error;
    }
  }

  async tryExecuteQuery(sqlStatement: string, values?: any[]): Promise<any> {
    if (this.getClsNamespace()?.get('remoteServiceCallCount') > 0) {
      this.getClsNamespace()?.set('dataStoreOperationAfterRemoteServiceCall', true);
    }

    log(Severity.DEBUG, 'Database DQL operation', sqlStatement);

    try {
      const response = await this.executeSql(this.getClsNamespace()?.get('connection'), sqlStatement, values);

      if (this.firstDbOperationFailureTimeInMillis) {
        this.firstDbOperationFailureTimeInMillis = 0;
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDataStoreType(), this.getDbHost(), 0);
      }

      return response;
    } catch (error) {
      if (!this.isDuplicateEntityError(error)) {
        if (this.firstDbOperationFailureTimeInMillis) {
          const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

          defaultServiceMetrics.recordDbFailureDurationInSecs(
            this.getDataStoreType(),
            this.getDbHost(),
            failureDurationInSecs
          );
        }

        defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDataStoreType(), this.getDbHost());

        log(Severity.ERROR, error.message, error.stack ?? '', {
          sqlStatement,
          function: `${this.constructor.name}.tryExecuteQuery`
        });
      }

      throw error;
    }
  }

  async tryExecuteQueryWithNamedParameters(sqlStatement: string, values: object): Promise<any> {
    if (this.getClsNamespace()?.get('remoteServiceCallCount') > 0) {
      this.getClsNamespace()?.set('dataStoreOperationAfterRemoteServiceCall', true);
    }

    log(Severity.DEBUG, 'Database DQL operation', sqlStatement);

    try {
      const response = await this.executeSqlWithNamedPlaceholders(
        this.getClsNamespace()?.get('connection'),
        sqlStatement,
        values
      );

      if (this.firstDbOperationFailureTimeInMillis) {
        this.firstDbOperationFailureTimeInMillis = 0;
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDataStoreType(), this.getDbHost(), 0);
      }

      return response;
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDataStoreType(),
          this.getDbHost(),
          failureDurationInSecs
        );
      }

      defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDataStoreType(), this.getDbHost());

      log(Severity.ERROR, error.message, error.stack ?? '', {
        sqlStatement,
        function: `${this.constructor.name}.tryExecuteQueryWithNamedParameters`
      });

      throw error;
    }
  }

  async executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T> {
    if (getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction')) {
      return executable();
    }

    this.getClsNamespace()?.set('globalTransaction', true);

    try {
      await this.tryBeginTransaction();

      if (this.firstDbOperationFailureTimeInMillis) {
        this.firstDbOperationFailureTimeInMillis = 0;
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDataStoreType(), this.getDbHost(), 0);
      }
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDataStoreType(),
          this.getDbHost(),
          failureDurationInSecs
        );
      }

      return [null, createBackkErrorFromError(error)];
    }

    const [result, error] = await executable();

    if (error) {
      try {
        await this.tryRollbackTransaction();
      } catch (error) {
        return [null, createBackkErrorFromError(error)];
      }
    } else {
      try {
        await this.tryCommitTransaction();
      } catch (error) {
        return [null, createBackkErrorFromError(error)];
      }
    }

    this.getClsNamespace()?.set('globalTransaction', false);
    return [result, error];
  }

  async createEntity<T extends BackkEntity>(
    EntityClass: new () => T,
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: PostHook<T>;
      postQueryOperations?: PostQueryOperations;
    },
    shouldReturnItem = true
  ): PromiseErrorOr<One<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'createEntity');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await createEntity(
      this,
      entity,
      EntityClass,
      options?.preHooks,
      options?.postHook,
      options?.postQueryOperations,
      false,
      shouldReturnItem
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  // noinspection OverlyComplexFunctionJS
  async addSubEntityToEntityById<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntity: Omit<U, 'id'> | { _id: string },
    EntityClass: { new (): T },
    _id: string,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntityToEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await addSubEntities(this, _id, subEntityPath, [subEntity], EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async addSubEntityToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntity: Omit<U, 'id'> | { _id: string },
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntityToEntityByFilters');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await addSubEntitiesByFilters(
      this,
      filters,
      subEntityPath,
      [subEntity],
      EntityClass,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
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
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntitiesToEntityByFilters');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await addSubEntitiesByFilters(
      this,
      filters,
      subEntityPath,
      subEntities,
      EntityClass,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  // noinspection OverlyComplexFunctionJS
  async addSubEntitiesToEntityById<T extends BackkEntity, U extends SubEntity>(
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
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntitiesToEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await addSubEntities(this, _id, subEntityPath, subEntities, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getAllEntities<T extends BackkEntity>(
    entityClass: new () => T,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByFilters');
    assertThatPostQueryOperationsAreValid(postQueryOperations);
    const response = await getAllEntities(
      this,
      entityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      entityCountRequests
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: EntitiesPostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<Many<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByFilters');
    assertThatPostQueryOperationsAreValid(postQueryOperations);
    const response = await getEntitiesByFilters(
      this,
      filters,
      EntityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityByFilters<T>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<One<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityByFilters');
    assertThatPostQueryOperationsAreValid(postQueryOperations);
    const response = await getEntityByFilters(
      this,
      filters,
      EntityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityCount<T>(
    entityClass: new () => T,
    filters?: QueryFilters<T>
  ): PromiseErrorOr<number> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityCount');
    const response = await getEntitiesCount(this, filters, entityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<One<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityById');
    assertThatPostQueryOperationsAreValid(postQueryOperations);
    const response = await getEntityById(
      this,
      _id,
      EntityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntitiesByIds<T>(
    EntityClass: { new (): T },
    _ids: string[],
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByIds');
    assertThatPostQueryOperationsAreValid(postQueryOperations);
    const response = await getEntitiesByIds(
      this,
      _ids,
      EntityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      entityCountRequests
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async updateEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entityUpdate: RecursivePartial<T> & { _id: string },
    options?: {
      preHooks?: PreHook | PreHook[];
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntity');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await updateEntity(
      this,
      entityUpdate,
      EntityClass,
      options?.preHooks,
      options?.entityPreHooks,
      options?.postHook,
      options?.postQueryOperations
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async updateEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntityByFilters');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await updateEntityByFilters(this, filters, entityUpdate, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async updateEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntitiesByFilters');
    const response = await updateEntitiesByFilters(this, filters, entityUpdate, EntityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await deleteEntityById(
      this,
      _id,
      EntityClass,
      options?.entityPreHooks,
      options?.postHook,
      options?.postQueryOperations
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntityByFilters');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await deleteEntityByFilters(this, filters, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteEntitiesByFilters<T extends object>(
    EntityClass: { new (): T },
    filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByFilters');
    const response = await deleteEntitiesByFilters(this, filters, EntityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeSubEntitiesFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntitiesFromEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await removeSubEntities(
      this,
      _id,
      subEntitiesJsonPath,
      EntityClass,
      options?.entityPreHooks,
      options?.postHook,
      options?.postQueryOperations
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeSubEntityFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntityFromEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
    const response = await this.removeSubEntitiesFromEntityById(subEntityJsonPath, EntityClass, _id, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeSubEntitiesFromEntityByFilters<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntitiesFromEntityByFilters');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await removeSubEntitiesByFilters(
      this,
      filters,
      subEntitiesJsonPath,
      EntityClass,
      options?.entityPreHooks,
      options?.postHook,
      options?.postQueryOperations
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeSubEntityFromEntityByFilters<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntityFromEntityByFilters');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
    const response = await removeSubEntitiesByFilters(
      this,
      filters,
      subEntityJsonPath,
      EntityClass,
      options?.entityPreHooks,
      options?.postHook,
      options?.postQueryOperations
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteAllEntities<T>(entityClass: new () => T): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteAllEntities');
    const response = await deleteAllEntities(this, entityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async addArrayFieldValuesToEntityById<T extends BackkEntity>(
    fieldName: keyof T & string,
    fieldValuesToAdd: (string | number | boolean)[],
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addArrayFieldValuesToEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await addFieldValues(this, _id, fieldName, fieldValuesToAdd, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async doesArrayFieldContainValueInEntityById<T extends BackkEntity>(
    fieldName: keyof T & string,
    fieldValue: string | number | boolean,
    EntityClass: { new (): T },
    _id: string
  ): PromiseErrorOr<boolean> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'doesArrayFieldContainValueInEntityById');
    const response = await doesEntityArrayFieldContainValue(this, EntityClass, _id, fieldName, fieldValue);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeArrayFieldValuesFromEntityById<T extends BackkEntity>(
    fieldName: keyof T & string,
    fieldValuesToRemove: (string | number | boolean)[],
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeArrayFieldValuesFromEntityById');
    assertThatPostQueryOperationsAreValid(options?.postQueryOperations);
    const response = await removeFieldValues(this, _id, fieldName, fieldValuesToRemove, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }
}
