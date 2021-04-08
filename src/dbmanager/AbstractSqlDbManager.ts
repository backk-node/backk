import { Injectable } from '@nestjs/common';
import SqlExpression from './sql/expressions/SqlExpression';
import AbstractDbManager, { Field } from './AbstractDbManager';
import createEntity from './sql/operations/dml/createEntity';
import getEntitiesByFilters from './sql/operations/dql/getEntitiesByFilters';
import getEntitiesCount from './sql/operations/dql/getEntitiesCount';
import getEntityById from './sql/operations/dql/getEntityById';
import getEntityWhere from './sql/operations/dql/getEntityWhere';
import getEntitiesWhere from './sql/operations/dql/getEntitiesWhere';
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
import deleteEntitiesWhere from './sql/operations/dml/deleteEntitiesWhere';
import { getNamespace } from 'cls-hooked';
import UserDefinedFilter from '../types/userdefinedfilters/UserDefinedFilter';
import updateEntityWhere from './sql/operations/dml/updateEntityWhere';
import getAllEntities from './sql/operations/dql/getAllEntities';
import { SubEntity } from '../types/entities/SubEntity';
import deleteEntitiesByFilters from './sql/operations/dml/deleteEntitiesByFilters';
import MongoDbQuery from './mongodb/MongoDbQuery';
import { PostHook } from './hooks/PostHook';
import { PromiseErrorOr } from '../types/PromiseErrorOr';
import updateEntitiesByFilters from './sql/operations/dml/updateEntitiesByFilters';
import { EntityPreHook } from './hooks/EntityPreHook';
import deleteEntityWhere from './sql/operations/dml/deleteEntityWhere';
import removeSubEntitiesWhere from './sql/operations/dml/removeSubEntitiesWhere';
import addFieldValues from './sql/operations/dml/addFieldValues';
import removeFieldValues from './sql/operations/dml/removeFieldValues';
import addSubEntitiesByFilters from './sql/operations/dml/addSubEntitiesByFilters';
import { EntitiesPostHook } from './hooks/EntitiesPostHook';
import getEntityByFilters from './sql/operations/dql/getEntityByFilters';
import deleteEntityByFilters from './sql/operations/dml/deleteEntityByFilters';
import updateEntityByFilters from './sql/operations/dml/updateEntityByFilters';
import removeSubEntitiesByFilters from './sql/operations/dml/removeSubEntitiesWhere';
import doesEntityArrayFieldContainValue from './sql/operations/dql/doesEntityArrayFieldContainValue';

@Injectable()
export default abstract class AbstractSqlDbManager extends AbstractDbManager {
  getClient(): any {
    return undefined;
  }

  cleanupTransaction() {
    // No operation
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
    mongoDbFilters: Array<MongoDbQuery<T>> | Partial<T> | object,
    sqlFilters: SqlExpression[] | SqlExpression | Partial<T> | object
  ): Array<MongoDbQuery<T> | SqlExpression> | Partial<T> | object {
    return sqlFilters instanceof SqlExpression ? [sqlFilters] : sqlFilters;
  }

  async isDbReady(): Promise<boolean> {
    try {
      await this.tryExecuteSqlWithoutCls(
        `SELECT * FROM ${this.schema.toLowerCase()}.__backk_db_initialization`,
        undefined,
        false
      );

      return true;
    } catch (error) {
      try {
        const createTableStatement = `CREATE TABLE IF NOT EXISTS ${this.schema.toLowerCase()}.__backk_db_initialization (appversion VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE, isinitialized ${this.getBooleanType()}, createdattimestamp ${this.getTimestampType()})`;
        await this.tryExecuteSqlWithoutCls(createTableStatement);
        return true;
      } catch (error) {
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
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
      }
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDbManagerType(),
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
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
      }
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDbManagerType(),
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
      this.getClsNamespace()?.set('dbManagerOperationAfterRemoteServiceCall', true);
    }

    log(Severity.DEBUG, 'Database DML operation', sqlStatement);

    try {
      const result = await this.executeSql(this.getClsNamespace()?.get('connection'), sqlStatement, values);
      return this.getResultFields(result);
    } catch (error) {
      if (shouldReportError && !this.isDuplicateEntityError(error)) {
        defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());

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
        defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());

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
      this.getClsNamespace()?.set('dbManagerOperationAfterRemoteServiceCall', true);
    }

    log(Severity.DEBUG, 'Database DQL operation', sqlStatement);

    try {
      const response = await this.executeSql(this.getClsNamespace()?.get('connection'), sqlStatement, values);

      if (this.firstDbOperationFailureTimeInMillis) {
        this.firstDbOperationFailureTimeInMillis = 0;
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
      }

      return response;
    } catch (error) {
      if (!this.isDuplicateEntityError(error)) {
        if (this.firstDbOperationFailureTimeInMillis) {
          const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

          defaultServiceMetrics.recordDbFailureDurationInSecs(
            this.getDbManagerType(),
            this.getDbHost(),
            failureDurationInSecs
          );
        }

        defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());

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
      this.getClsNamespace()?.set('dbManagerOperationAfterRemoteServiceCall', true);
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
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
      }

      return response;
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDbManagerType(),
          this.getDbHost(),
          failureDurationInSecs
        );
      }

      defaultServiceMetrics.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());

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
        defaultServiceMetrics.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
      }
    } catch (error) {
      if (this.firstDbOperationFailureTimeInMillis) {
        const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;

        defaultServiceMetrics.recordDbFailureDurationInSecs(
          this.getDbManagerType(),
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

  async createEntity<T extends BackkEntity | SubEntity>(
    entityClass: new () => T,
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: PostHook<T>;
      postQueryOperations?: PostQueryOperations;
    },
    shouldReturnItem = true
  ): PromiseErrorOr<T> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'createEntity');
    const response = await createEntity(
      this,
      entity,
      entityClass,
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
      ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntityToEntityById');
    const response = await addSubEntities(this, _id, subEntityPath, [subEntity], EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async addSubEntityToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntity: Omit<U, 'id'> | { _id: string },
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntityToEntityByFilters');
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
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntitiesToEntityByFilters');
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
      ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntitiesToEntityById');
    const response = await addSubEntities(this, _id, subEntityPath, subEntities, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getAllEntities<T>(
    entityClass: new () => T,
    options?: {
      postQueryOperations?: PostQueryOperations;
    }
  ): PromiseErrorOr<T[]> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByFilters');
    const response = await getAllEntities(this, entityClass, options?.postQueryOperations);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntitiesByFilters<T>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: EntitiesPostHook<T>;
    }
  ): PromiseErrorOr<T[]> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByFilters');
    const response = await getEntitiesByFilters(this, filters, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityByFilters<T>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<T> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityByFilters');
    const response = await getEntityByFilters(this, filters, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityCount<T>(
    entityClass: new () => T,
    filters?: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<number> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityCount');
    const response = await getEntitiesCount(this, filters, entityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityById<T>(
    EntityClass: { new (): T },
    _id: string,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<T> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityById');
    const response = await getEntityById(this, _id, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntitiesByIds<T>(
    EntityClass: { new (): T },
    _ids: string[],
    options?: { postQueryOperations?: PostQueryOperations }
  ): PromiseErrorOr<T[]> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByIds');
    const response = await getEntitiesByIds(this, _ids, EntityClass, options?.postQueryOperations);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntityByField<T>(
    entityClass: new () => T,
    fieldPathName: string,
    fieldValue: any,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
      ifEntityNotFoundReturn?: () => PromiseErrorOr<T>;
    },
    isSelectForUpdate = false
  ): PromiseErrorOr<T> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityByField');
    const response = await getEntityWhere(
      this,
      fieldPathName,
      fieldValue,
      entityClass,
      options?.preHooks,
      options?.postQueryOperations,
      options?.postHook,
      options?.ifEntityNotFoundReturn,
      isSelectForUpdate
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async getEntitiesByField<T>(
    EntityClass: { new (): T },
    fieldPathName: string,
    fieldValue: any,
    options?: { postQueryOperations?: PostQueryOperations }
  ): PromiseErrorOr<T[]> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByField');

    const response = await getEntitiesWhere(
      this,
      fieldPathName,
      fieldValue,
      EntityClass,
      options?.postQueryOperations
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
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    entityUpdate: Partial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntityByFilters');
    const response = await updateEntityByFilters(this, filters, entityUpdate, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async updateEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    entityUpdate: Partial<T>
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntitiesByFilters');
    const response = await updateEntitiesByFilters(this, filters, entityUpdate, EntityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async updateEntityByField<T extends BackkEntity>(
    EntityClass: { new (): T },
    fieldPathName: string,
    fieldValue: any,
    entityUpdate: RecursivePartial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntityByField');

    const response = await updateEntityWhere(
      this,
      fieldPathName,
      fieldValue,
      entityUpdate,
      EntityClass,
      options?.entityPreHooks,
      options?.postHook,
      options?.postQueryOperations
    );

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

  async deleteEntitiesByField<T extends object>(
    EntityClass: { new (): T },
    fieldName: keyof T & string,
    fieldValue: T[keyof T] | string
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByField');
    const response = await deleteEntitiesWhere(this, fieldName, fieldValue, EntityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteEntityByField<T extends BackkEntity>(
    EntityClass: { new (): T },
    fieldName: keyof T & string,
    fieldValue: T[keyof T],
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntityByField');
    const response = await deleteEntityWhere(
      this,
      fieldName,
      fieldValue,
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
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntityByFilters');
    const response = await deleteEntityByFilters(this, filters, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteEntitiesByFilters<T extends object>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByFilters');
    const response = await deleteEntitiesByFilters(this, filters, EntityClass);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeSubEntitiesByJsonPathFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntitiesByJsonPathFromEntityById');

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

  async removeSubEntityByIdFromEntityById<T extends BackkEntity>(
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
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntityByIdFromEntityById');
    const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
    const response = await this.removeSubEntitiesByJsonPathFromEntityById(
      subEntityJsonPath,
      EntityClass,
      _id,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeSubEntitiesByJsonPathFromEntityByFilters<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(
      this,
      'removeSubEntitiesByJsonPathFromEntityByFilters'
    );
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

  async removeSubEntityByIdFromEntityByFilters<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeSubEntityByIdFromEntityByFilters');
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

  async addEntityArrayFieldValues<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    fieldName: keyof T & string,
    fieldValues: (string | number | boolean)[],
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addEntityArrayFieldValues');
    const response = await addFieldValues(this, _id, fieldName, fieldValues, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async doesEntityArrayFieldContainValue<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    fieldName: keyof T & string,
    fieldValue: string | number | boolean
  ): PromiseErrorOr<boolean> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'doesEntityArrayFieldContainValue');
    const response = await doesEntityArrayFieldContainValue(this, EntityClass, _id, fieldName, fieldValue);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async removeEntityArrayFieldValues<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    fieldName: keyof T & string,
    fieldValues: (string | number | boolean)[],
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'removeEntityArrayFieldValues');
    const response = await removeFieldValues(this, _id, fieldName, fieldValues, EntityClass, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }
}
