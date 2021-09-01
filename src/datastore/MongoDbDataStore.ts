import { FilterQuery, MongoClient, ObjectId } from 'mongodb';
import SqlExpression from './sql/expressions/SqlExpression';
import AbstractDataStore, { Field, Many, One } from './AbstractDataStore';
import { RecursivePartial } from '../types/RecursivePartial';
import { PreHook } from './hooks/PreHook';
import { BackkEntity } from '../types/entities/BackkEntity';
import { PostQueryOperations } from '../types/postqueryoperations/PostQueryOperations';
import createBackkErrorFromError from '../errors/createBackkErrorFromError';
import UserDefinedFilter from '../types/userdefinedfilters/UserDefinedFilter';
import { SubEntity } from '../types/entities/SubEntity';
import tryStartLocalTransactionIfNeeded from './sql/operations/transaction/tryStartLocalTransactionIfNeeded';
import tryExecutePreHooks from './hooks/tryExecutePreHooks';
import hashAndEncryptEntity from '../crypt/hashAndEncryptEntity';
import cleanupLocalTransactionIfNeeded from './sql/operations/transaction/cleanupLocalTransactionIfNeeded';
import { getNamespace } from 'cls-hooked';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import createInternalServerError from '../errors/createInternalServerError';
import getClassPropertyNameToPropertyTypeNameMap from '../metadata/getClassPropertyNameToPropertyTypeNameMap';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import isEntityTypeName from '../utils/type/isEntityTypeName';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import forEachAsyncParallel from '../utils/forEachAsyncParallel';
import forEachAsyncSequential from '../utils/forEachAsyncSequential';
import startDbOperation from './utils/startDbOperation';
import recordDbOperationDuration from './utils/recordDbOperationDuration';
import { JSONPath } from 'jsonpath-plus';
import findParentEntityAndPropertyNameForSubEntity from '../metadata/findParentEntityAndPropertyNameForSubEntity';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import performPostQueryOperations from './mongodb/performPostQueryOperations';
import tryFetchAndAssignSubEntitiesForManyToManyRelationships from './mongodb/tryFetchAndAssignSubEntitiesForManyToManyRelationships';
import decryptEntities from '../crypt/decryptEntities';
import updateDbLocalTransactionCount from './sql/operations/dql/utils/updateDbLocalTransactionCount';
import shouldUseRandomInitializationVector from '../crypt/shouldUseRandomInitializationVector';
import shouldEncryptValue from '../crypt/shouldEncryptValue';
import encrypt from '../crypt/encrypt';
import removePrivateProperties from './mongodb/removePrivateProperties';
import replaceIdStringsWithObjectIds from './mongodb/replaceIdStringsWithObjectIds';
import removeSubEntities from './mongodb/removeSubEntities';
import getJoinPipelines from './mongodb/getJoinPipelines';
import convertUserDefinedFiltersToMatchExpression from './mongodb/convertUserDefinedFiltersToMatchExpression';
import MongoDbQuery from './mongodb/MongoDbQuery';
import getRootOperations from './mongodb/getRootOperations';
import convertMongoDbQueriesToMatchExpression from './mongodb/convertMongoDbQueriesToMatchExpression';
import paginateSubEntities from './mongodb/paginateSubEntities';
import convertFilterObjectToMongoDbQueries from './mongodb/convertFilterObjectToMongoDbQueries';
import { PostHook } from './hooks/PostHook';
import tryExecutePostHook from './hooks/tryExecutePostHook';
import getTableName from './utils/getTableName';
import getFieldOrdering from './mongodb/getFieldOrdering';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../errors/backkErrors';
import { PromiseErrorOr } from '../types/PromiseErrorOr';
import isBackkError from '../errors/isBackkError';
import { ErrorOr } from '../types/ErrorOr';
import { EntityPreHook } from './hooks/EntityPreHook';
import tryExecuteEntityPreHooks from './hooks/tryExecuteEntityPreHooks';
import handleNestedManyToManyRelations from './mongodb/handleNestedManyToManyRelations';
import handleNestedOneToManyRelations from './mongodb/handleNestedOneToManyRelations';
import addSimpleSubEntitiesOrValuesByEntityId from './mongodb/addSimpleSubEntitiesOrValuesByEntityId';
import removeSimpleSubEntityById from './mongodb/removeSimpleSubEntityById';
import removeSimpleSubEntityByIdFromEntityByFilters from './mongodb/removeSimpleSubEntityByIdFromEntityByFilters';
import getEntitiesByFilters from './mongodb/operations/dql/getEntitiesByFilters';
import removeFieldValues from './mongodb/removeFieldValues';
import { HttpStatusCodes } from '../constants/constants';
import { EntitiesPostHook } from './hooks/EntitiesPostHook';
import findSubEntityClass from '../utils/type/findSubEntityClass';
import getEntityByFilters from './mongodb/operations/dql/getEntityByFilters';
import addSimpleSubEntitiesOrValuesByFilters from './mongodb/addSimpleSubEntitiesOrValuesByFilters';
import DefaultPostQueryOperations from '../types/postqueryoperations/DefaultPostQueryOperations';
import createCurrentPageTokens from './utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from './utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../types/EntityCountRequest';
import throwException from '../utils/throwException';

export default class MongoDbDataStore extends AbstractDataStore {
  private readonly uri: string;
  private mongoClient: MongoClient;

  constructor() {
    super('', process.env.DB_NAME ?? throwException('DB_NAME environment variable must be defined'));
    this.uri =
      process.env.MONGO_DB_URI ?? throwException('MONGO_DB_URI environment variable must be defined');
    this.mongoClient = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  getClient() {
    return this.mongoClient;
  }

  getIdColumnType(): string {
    throw new Error('Not implemented');
  }

  getTimestampType(): string {
    throw new Error('Not implemented');
  }

  getVarCharType(): string {
    throw new Error('Not implemented');
  }

  getBooleanType(): string {
    throw new Error('Not implemented');
  }

  isDuplicateEntityError(): boolean {
    return false;
  }

  getModifyColumnStatement(): string {
    throw new Error('Not implemented');
  }

  getFilters<T>(
    mongoDbFilters: Array<MongoDbQuery<T>> | FilterQuery<T> | Partial<T> | object
  ): Array<MongoDbQuery<T> | SqlExpression> | Partial<T> | object {
    return Array.isArray(mongoDbFilters) ? mongoDbFilters : [new MongoDbQuery(mongoDbFilters)];
  }

  async tryExecute<T>(
    shouldUseTransaction: boolean,
    executeDbOperations: (client: MongoClient) => Promise<T>
  ): Promise<T> {
    if (this.getClsNamespace()?.get('remoteServiceCallCount') > 0) {
      this.getClsNamespace()?.set('dataStoreOperationAfterRemoteServiceCall', true);
    }

    if (shouldUseTransaction) {
      const session = this.getClsNamespace()?.get('session');
      if (!session) {
        throw new Error('Session not set');
      }

      let result: T | undefined;

      await session.withTransaction(async () => {
        result = await executeDbOperations(this.mongoClient);
      });

      return result as T;
    } else {
      return await executeDbOperations(this.mongoClient);
    }
  }

  tryExecuteSql<T>(): Promise<Field[]> {
    throw new Error('Not implemented');
  }

  tryExecuteSqlWithoutCls<T>(): Promise<Field[]> {
    throw new Error('Not implemented');
  }

  getDataStoreType(): string {
    return 'MongoDB';
  }

  getDbHost(): string {
    return this.uri;
  }

  async isDbReady(): Promise<boolean> {
    try {
      await this.tryReserveDbConnectionFromPool();

      await this.tryExecute(false, (client) =>
        client
          .db(this.dbName)
          .collection('__backk__')
          .findOne({})
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async tryBeginTransaction(): Promise<void> {
    try {
      const session = this.getClient().startSession();
      this.getClsNamespace()?.set('session', session);
    } catch (error) {
      try {
        await this.mongoClient.close();
      } catch (error) {
        // NO OPERATION
      }

      this.mongoClient = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await this.tryReserveDbConnectionFromPool();
      this.getClsNamespace()?.set('session', this.getClient().startSession());
    }
  }

  cleanupTransaction() {
    this.getClsNamespace()
      ?.get('session')
      ?.endSession();
  }

  async executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T> {
    if (getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction')) {
      return executable();
    }

    this.getClsNamespace()?.set('globalTransaction', true);

    let result: ErrorOr<T> = [null, createInternalServerError('Transaction execution error')];

    try {
      await this.tryBeginTransaction();
      const session = this.getClsNamespace()?.get('session');

      await session.withTransaction(async () => {
        result = await executable();
      });

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
    } finally {
      this.cleanupTransaction();
    }

    this.getClsNamespace()?.set('globalTransaction', false);
    return result;
  }

  async createEntity<T extends BackkEntity>(
    EntityClass: new () => T,
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: PostHook<T>;
      postQueryOperations?: PostQueryOperations;
    },
    isInternalCall = false
  ): PromiseErrorOr<One<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'createEntity');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    const Types = this.getTypes();
    let shouldUseTransaction = false;

    try {
      await hashAndEncryptEntity(entity, EntityClass, Types);
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);
        Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
          if (typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, fieldName)) {
            delete (entity as any)[fieldName];
          }

          const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);

          if (!isArrayType && !isEntityTypeName(baseTypeName) && fieldName !== '_id') {
            if (fieldName === 'version') {
              (entity as any).version = 1;
            } else if (fieldName === 'lastModifiedTimestamp' || fieldName === 'createdAtTimestamp') {
              (entity as any)[fieldName] = new Date();
            }
          } else if (
            isArrayType &&
            isEntityTypeName(baseTypeName) &&
            typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, fieldName)
          ) {
            (entity as any)[fieldName] = ((entity as any)[fieldName] ?? []).map(
              (subEntity: any) => subEntity._id
            );
          } else if (isEntityTypeName(baseTypeName)) {
            handleNestedManyToManyRelations(entity, Types, (Types as any)[baseTypeName], fieldName);
          }
        });

        await tryExecutePreHooks(options?.preHooks ?? []);
        let createEntityResult;

        try {
          createEntityResult = await client
            .db(this.dbName)
            .collection(EntityClass.name.toLowerCase())
            .insertOne(entity);
        } catch (error) {
          if (error.message.startsWith('E11000 duplicate key error')) {
            return [
              null,
              createBackkErrorFromErrorCodeMessageAndStatus({
                ...BACKK_ERRORS.DUPLICATE_ENTITY,
                message: `Duplicate ${EntityClass.name.charAt(0).toLowerCase()}${EntityClass.name.slice(1)}`
              })
            ];
          }

          throw error;
        }

        const _id = createEntityResult?.insertedId.toHexString();

        const [createdEntity, error] = isInternalCall
          ? [
              { metadata: { currentPageTokens: undefined, entityCounts: undefined }, data: { _id } as T },
              null
            ]
          : await this.getEntityById(
              EntityClass,
              _id,
              options?.postQueryOperations ?? new DefaultPostQueryOperations(),
              false
            );

        if (options?.postHook) {
          await tryExecutePostHook(options?.postHook, createdEntity);
        }

        return [createdEntity, error];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  addSubEntityToEntityById<T extends BackkEntity, U extends SubEntity>(
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
    const response = this.addSubEntitiesToEntityById(subEntityPath, [subEntity], EntityClass, _id, options);
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  addSubEntityToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntity: Omit<U, 'id'> | { _id: string },
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntityToEntityByFilters');
    const response = this.addSubEntitiesToEntityByFilters(
      subEntityPath,
      [subEntity],
      EntityClass,
      filters,
      options
    );
    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    const SubEntityClass = findSubEntityClass(subEntityPath, EntityClass, this.getTypes());
    if (!SubEntityClass) {
      throw new Error('Invalid subEntityPath: ' + subEntityPath);
    }
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        const isNonNestedColumnName = subEntityPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
        let updateError;

        if (isNonNestedColumnName) {
          [, updateError] = await addSimpleSubEntitiesOrValuesByEntityId(
            client,
            this,
            _id,
            subEntityPath,
            subEntities,
            EntityClass,
            options
          );
        } else {
          let [currentEntity, error] = await this.getEntityById(
            EntityClass,
            _id,
            options?.postQueryOperations ?? new DefaultPostQueryOperations(),
            false,
            undefined,
            true,
            true
          );

          if (error?.statusCode === HttpStatusCodes.NOT_FOUND && options?.ifEntityNotFoundUse) {
            [currentEntity, error] = await options.ifEntityNotFoundUse();
          }

          if (!currentEntity) {
            return [null, error];
          }

          await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
          const [parentEntity] = JSONPath({
            json: currentEntity,
            path: subEntityPath + '^'
          });

          const [subEntities] = JSONPath({ json: currentEntity, path: subEntityPath });
          const maxSubItemId = subEntities.reduce((maxSubItemId: number, subEntity: any) => {
            const subItemId = parseInt(subEntity.id, 10);
            return subItemId > maxSubItemId ? subItemId : maxSubItemId;
          }, -1);

          const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity(
            EntityClass,
            SubEntityClass,
            this.getTypes()
          );

          if (parentEntityClassAndPropertyNameForSubEntity) {
            const metadataForValidations = getFromContainer(MetadataStorage).getTargetValidationMetadatas(
              parentEntityClassAndPropertyNameForSubEntity[0],
              ''
            );

            const foundArrayMaxSizeValidation = metadataForValidations.find(
              (validationMetadata: ValidationMetadata) =>
                validationMetadata.propertyName === parentEntityClassAndPropertyNameForSubEntity[1] &&
                validationMetadata.type === 'arrayMaxSize'
            );

            if (
              foundArrayMaxSizeValidation &&
              maxSubItemId + subEntities.length >= foundArrayMaxSizeValidation.constraints[0]
            ) {
              // noinspection ExceptionCaughtLocallyJS
              throw createBackkErrorFromErrorCodeMessageAndStatus({
                ...BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED,
                message:
                  parentEntityClassAndPropertyNameForSubEntity[0].name +
                  '.' +
                  parentEntityClassAndPropertyNameForSubEntity[1] +
                  ': ' +
                  BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message
              });
            }
          }

          await forEachAsyncParallel(subEntities, async (newSubEntity, index) => {
            if (
              parentEntityClassAndPropertyNameForSubEntity &&
              typePropertyAnnotationContainer.isTypePropertyManyToMany(
                parentEntityClassAndPropertyNameForSubEntity[0],
                parentEntityClassAndPropertyNameForSubEntity[1]
              )
            ) {
              parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push(newSubEntity);
            } else if (parentEntityClassAndPropertyNameForSubEntity) {
              parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push({
                ...(newSubEntity as any),
                id: (maxSubItemId + 1 + index).toString()
              });
            }
          });

          [, updateError] = await this.updateEntity(EntityClass, currentEntity as any, undefined);
        }

        if (options?.postHook) {
          await tryExecutePostHook(options?.postHook, null);
        }

        return [null, updateError];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntities: Array<Omit<U, 'id'> | { _id: string }>,
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addSubEntitiesToEntityById');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    const SubEntityClass = findSubEntityClass(subEntityPath, EntityClass, this.getTypes());
    if (!SubEntityClass) {
      throw new Error('Invalid subEntityPath: ' + subEntityPath);
    }
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        const isNonNestedColumnName = subEntityPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
        let updateError;

        if (isNonNestedColumnName) {
          [, updateError] = await addSimpleSubEntitiesOrValuesByFilters(
            client,
            this,
            filters,
            subEntityPath,
            subEntities,
            EntityClass,
            options
          );
        } else {
          let [currentEntity, error] = await this.getEntityByFilters(
            EntityClass,
            filters,
            options?.postQueryOperations ?? new DefaultPostQueryOperations(),
            false,
            undefined,
            true,
            true
          );

          if (error?.statusCode === HttpStatusCodes.NOT_FOUND && options?.ifEntityNotFoundUse) {
            [currentEntity, error] = await options.ifEntityNotFoundUse();
          }

          if (!currentEntity) {
            return [null, error];
          }

          await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
          const [parentEntity] = JSONPath({
            json: currentEntity,
            path: subEntityPath + '^'
          });

          const [subEntities] = JSONPath({ json: currentEntity, path: subEntityPath });
          const maxSubItemId = subEntities.reduce((maxSubItemId: number, subEntity: any) => {
            const subItemId = parseInt(subEntity.id, 10);
            return subItemId > maxSubItemId ? subItemId : maxSubItemId;
          }, -1);

          const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity(
            EntityClass,
            SubEntityClass,
            this.getTypes()
          );

          if (parentEntityClassAndPropertyNameForSubEntity) {
            const metadataForValidations = getFromContainer(MetadataStorage).getTargetValidationMetadatas(
              parentEntityClassAndPropertyNameForSubEntity[0],
              ''
            );

            const foundArrayMaxSizeValidation = metadataForValidations.find(
              (validationMetadata: ValidationMetadata) =>
                validationMetadata.propertyName === parentEntityClassAndPropertyNameForSubEntity[1] &&
                validationMetadata.type === 'arrayMaxSize'
            );

            if (
              foundArrayMaxSizeValidation &&
              maxSubItemId + subEntities.length >= foundArrayMaxSizeValidation.constraints[0]
            ) {
              // noinspection ExceptionCaughtLocallyJS
              throw createBackkErrorFromErrorCodeMessageAndStatus({
                ...BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED,
                message:
                  parentEntityClassAndPropertyNameForSubEntity[0].name +
                  '.' +
                  parentEntityClassAndPropertyNameForSubEntity[1] +
                  ': ' +
                  BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message
              });
            }
          }

          await forEachAsyncParallel(subEntities, async (newSubEntity, index) => {
            if (
              parentEntityClassAndPropertyNameForSubEntity &&
              typePropertyAnnotationContainer.isTypePropertyManyToMany(
                parentEntityClassAndPropertyNameForSubEntity[0],
                parentEntityClassAndPropertyNameForSubEntity[1]
              )
            ) {
              parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push(newSubEntity);
            } else if (parentEntityClassAndPropertyNameForSubEntity) {
              parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push({
                ...(newSubEntity as any),
                id: (maxSubItemId + 1 + index).toString()
              });
            }
          });

          [, updateError] = await this.updateEntity(EntityClass, currentEntity as any, undefined);
        }

        if (options?.postHook) {
          await tryExecutePostHook(options?.postHook, null);
        }

        return [null, updateError];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async getAllEntities<T extends BackkEntity>(
    EntityClass: new () => T,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getAllEntities');
    updateDbLocalTransactionCount(this);
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    if (allowFetchingOnlyPreviousOrNextPage) {
      tryEnsurePreviousOrNextPageIsRequested(
        postQueryOperations.currentPageTokens,
        postQueryOperations.paginations
      );
    }

    try {
      let isSelectForUpdate = false;

      if (
        getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
        this.getClsNamespace()?.get('globalTransaction') ||
        this.getClsNamespace()?.get('localTransaction')
      ) {
        isSelectForUpdate = true;
      }

      const entities = await this.tryExecute(false, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.dbName)
            .collection(EntityClass.name.toLowerCase())
            .updateMany({}, { $set: { _backkLock: new ObjectId() } });
        }

        const joinPipelines = getJoinPipelines(EntityClass, this.getTypes());

        const cursor = client
          .db(this.dbName)
          .collection<T>(getTableName(EntityClass.name))
          .aggregate([...joinPipelines, getFieldOrdering(EntityClass)])
          .match({});

        performPostQueryOperations(cursor, postQueryOperations, EntityClass, this.getTypes());

        const shouldReturnRootEntityCount = !!entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
        );

        const [rows, count] = await Promise.all([
          cursor.toArray(),
          shouldReturnRootEntityCount
            ? client
                .db(this.dbName)
                .collection<T>(getTableName(EntityClass.name))
                .countDocuments({})
            : Promise.resolve(undefined)
        ]);

        if (count !== undefined) {
          rows.forEach((row) => {
            (row as any)._count = count;
          });
        }

        await tryFetchAndAssignSubEntitiesForManyToManyRelationships(
          this,
          rows,
          EntityClass,
          this.getTypes(),
          undefined,
          postQueryOperations,
          entityCountRequests
        );

        paginateSubEntities(
          rows,
          postQueryOperations.paginations,
          EntityClass,
          this.getTypes(),
          entityCountRequests
        );
        removePrivateProperties(rows, EntityClass, this.getTypes());
        decryptEntities(rows, EntityClass, this.getTypes(), false);
        return rows;
      });

      return [
        {
          metadata: {
            currentPageTokens: allowFetchingOnlyPreviousOrNextPage
              ? createCurrentPageTokens(postQueryOperations.paginations)
              : undefined
          },
          data: entities
        },
        null
      ];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  getEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: EntitiesPostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<Many<T>> {
    return getEntitiesByFilters(
      this,
      filters,
      EntityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      options
    );
  }

  async getEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    },
    isSelectForUpdate = false,
    isInternalCall = false
  ): PromiseErrorOr<One<T>> {
    return getEntityByFilters(
      this,
      filters,
      EntityClass,
      postQueryOperations,
      allowFetchingOnlyPreviousOrNextPage,
      options,
      isSelectForUpdate,
      isInternalCall
    );
  }

  async getEntityCount<T>(
    EntityClass: new () => T,
    filters?: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression> | Partial<T>
  ): PromiseErrorOr<number> {
    let matchExpression: object;
    let finalFilters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else if (filters) {
      finalFilters = filters;
    } else {
      finalFilters = [];
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlExpression)) {
      throw new Error('SqlExpression is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbQuery<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression
      };
    }

    replaceIdStringsWithObjectIds(matchExpression);

    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityCount');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    try {
      const entityCount = await this.tryExecute(false, async (client) => {
        return client
          .db(this.dbName)
          .collection<T>(getTableName(EntityClass.name))
          .countDocuments(matchExpression);
      });

      return [entityCount, null];
    } catch (error) {
      return [null, createBackkErrorFromError(error)];
    } finally {
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async getEntityById<T extends BackkEntity>(
    EntityClass: new () => T,
    _id: string,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: PostHook<T>;
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      entityCountRequests?: EntityCountRequest[];
    },
    isSelectForUpdate = false,
    isInternalCall = false
  ): PromiseErrorOr<One<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityById');

    if (allowFetchingOnlyPreviousOrNextPage) {
      tryEnsurePreviousOrNextPageIsRequested(
        postQueryOperations.currentPageTokens,
        postQueryOperations.paginations
      );
    }

    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      if (
        postQueryOperations.includeResponseFields?.length === 1 &&
        postQueryOperations.includeResponseFields[0] === '_id'
      ) {
        return [
          {
            metadata: { currentPageTokens: undefined },
            data: ({ _id } as unknown) as T
          },
          null
        ];
      }

      if (options?.postHook || options?.preHooks || options?.ifEntityNotFoundReturn) {
        shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);
      }

      updateDbLocalTransactionCount(this);

      if (
        getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
        this.getClsNamespace()?.get('globalTransaction') ||
        this.getClsNamespace()?.get('localTransaction')
      ) {
        // noinspection AssignmentToFunctionParameterJS
        isSelectForUpdate = true;
      }

      const entities = await this.tryExecute(shouldUseTransaction, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.dbName)
            .collection(EntityClass.name.toLowerCase())
            .findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: { _backkLock: new ObjectId() } });
        }

        if (options?.preHooks) {
          await tryExecutePreHooks(options.preHooks);
        }

        const joinPipelines = getJoinPipelines(EntityClass, this.getTypes());

        const cursor = client
          .db(this.dbName)
          .collection<T>(getTableName(EntityClass.name))
          .aggregate([...joinPipelines, getFieldOrdering(EntityClass)])
          .match({ _id: new ObjectId(_id) });

        performPostQueryOperations(cursor, postQueryOperations, EntityClass, this.getTypes());

        const shouldReturnRootEntityCount = !!options?.entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
        );

        const [rows, count] = await Promise.all([
          cursor.toArray(),
          shouldReturnRootEntityCount
            ? client
                .db(this.dbName)
                .collection<T>(getTableName(EntityClass.name))
                .countDocuments({ _id: new ObjectId(_id) } as object)
            : Promise.resolve(undefined)
        ]);

        if (count !== undefined) {
          rows.forEach((row) => {
            (row as any)._count = count;
          });
        }

        await tryFetchAndAssignSubEntitiesForManyToManyRelationships(
          this,
          rows,
          EntityClass,
          this.getTypes(),
          undefined,
          postQueryOperations,
          options?.entityCountRequests,
          isInternalCall
        );

        paginateSubEntities(rows, postQueryOperations.paginations, EntityClass, this.getTypes());
        removePrivateProperties(rows, EntityClass, this.getTypes(), isInternalCall);
        decryptEntities(rows, EntityClass, this.getTypes(), false);
        return rows;
      });

      let entity: One<T> | null | undefined = {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations.paginations)
            : undefined
        },
        data: entities[0]
      };

      let error = null;

      if (entities.length === 0) {
        if (options?.ifEntityNotFoundReturn) {
          [entity, error] = await options.ifEntityNotFoundReturn();
        } else {
          return [
            null,
            createBackkErrorFromErrorCodeMessageAndStatus({
              ...BACKK_ERRORS.ENTITY_NOT_FOUND,
              message: `${EntityClass.name} with _id: ${_id} not found`
            })
          ];
        }
      }

      if (options?.postHook) {
        await tryExecutePostHook(options?.postHook, entity);
      }

      return [entity, error];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async getEntitiesByIds<T>(
    EntityClass: { new (): T },
    _ids: string[],
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntitiesByIds');
    if (allowFetchingOnlyPreviousOrNextPage) {
      tryEnsurePreviousOrNextPageIsRequested(
        postQueryOperations.currentPageTokens,
        postQueryOperations.paginations
      );
    }

    updateDbLocalTransactionCount(this);
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    try {
      let isSelectForUpdate = false;

      if (
        getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
        this.getClsNamespace()?.get('globalTransaction') ||
        this.getClsNamespace()?.get('localTransaction')
      ) {
        isSelectForUpdate = true;
      }

      const entities = await this.tryExecute(false, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.dbName)
            .collection(EntityClass.name.toLowerCase())
            .updateMany(
              { _id: { $in: _ids.map((_id: string) => new ObjectId(_id)) } },
              { $set: { _backkLock: new ObjectId() } }
            );
        }

        const joinPipelines = getJoinPipelines(EntityClass, this.getTypes());
        const cursor = client
          .db(this.dbName)
          .collection<T>(getTableName(EntityClass.name))
          .aggregate([...joinPipelines, getFieldOrdering(EntityClass)])
          .match({ _id: { $in: _ids.map((_id: string) => new ObjectId(_id)) } });

        performPostQueryOperations(cursor, postQueryOperations, EntityClass, this.getTypes());

        const shouldReturnRootEntityCount = !!entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
        );

        const [rows, count] = await Promise.all([
          cursor.toArray(),
          shouldReturnRootEntityCount
            ? client
                .db(this.dbName)
                .collection<T>(getTableName(EntityClass.name))
                .countDocuments({ _id: { $in: _ids.map((_id: string) => new ObjectId(_id)) } } as object)
            : Promise.resolve(undefined)
        ]);

        if (count !== undefined) {
          rows.forEach((row) => {
            (row as any)._count = count;
          });
        }

        await tryFetchAndAssignSubEntitiesForManyToManyRelationships(
          this,
          rows,
          EntityClass,
          this.getTypes(),
          undefined,
          postQueryOperations,
          entityCountRequests
        );

        paginateSubEntities(rows, postQueryOperations.paginations, EntityClass, this.getTypes());
        removePrivateProperties(rows, EntityClass, this.getTypes());
        decryptEntities(rows, EntityClass, this.getTypes(), false);
        return rows;
      });

      return [
        {
          metadata: {
            currentPageTokens: allowFetchingOnlyPreviousOrNextPage
              ? createCurrentPageTokens(postQueryOperations.paginations)
              : undefined
          },
          data: entities
        },
        null
      ];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async updateEntity<T extends BackkEntity>(
    EntityClass: new () => T,
    { _id, id, ...restOfEntity }: RecursivePartial<T> & { _id: string },
    options?: {
      preHooks?: PreHook | PreHook[];
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postHook?: PostHook<T>;
      postQueryOperations?: PostQueryOperations;
    },
    isRecursiveCall = false,
    isInternalCall = false
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntity');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    const Types = this.getTypes();
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      if (!isRecursiveCall) {
        await hashAndEncryptEntity(restOfEntity, EntityClass as any, Types);
      }

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        let currentEntity: One<T> | null | undefined = null;
        let error = null;

        if (
          !isRecursiveCall &&
          (options?.entityPreHooks || restOfEntity.version || restOfEntity.lastModifiedTimestamp)
        ) {
          [currentEntity, error] = await this.getEntityById(
            EntityClass,
            _id,
            options?.postQueryOperations ?? new DefaultPostQueryOperations(),
            false,
            undefined,
            true,
            true
          );

          if (!currentEntity) {
            return [null, error];
          }

          let eTagCheckPreHook: EntityPreHook<T>;
          let finalEntityPreHooks = Array.isArray(options?.entityPreHooks)
            ? options?.entityPreHooks ?? []
            : options?.entityPreHooks
            ? [options?.entityPreHooks]
            : [];

          if (!isInternalCall && currentEntity) {
            if ('version' in currentEntity && restOfEntity.version && restOfEntity.version !== -1) {
              eTagCheckPreHook = {
                shouldSucceedOrBeTrue: ({ version }) => version === restOfEntity.version,
                error: BACKK_ERRORS.ENTITY_VERSION_MISMATCH
              };

              finalEntityPreHooks = [eTagCheckPreHook, ...finalEntityPreHooks];
            } else if (
              'lastModifiedTimestamp' in currentEntity &&
              (restOfEntity as any).lastModifiedTimestamp &&
              (restOfEntity as any).lastModifiedTimestamp.getTime() !== 0
            ) {
              eTagCheckPreHook = {
                shouldSucceedOrBeTrue: ({ lastModifiedTimestamp }) =>
                  lastModifiedTimestamp?.getTime() === (restOfEntity as any).lastModifiedTimestamp.getTime(),
                error: BACKK_ERRORS.ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH
              };

              finalEntityPreHooks = [eTagCheckPreHook, ...finalEntityPreHooks];
            }
          }

          await tryExecuteEntityPreHooks(finalEntityPreHooks, currentEntity);
        }

        await tryExecutePreHooks(options?.preHooks ?? []);

        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

        await forEachAsyncSequential(Object.entries(entityMetadata), async ([fieldName, fieldTypeName]) => {
          if (typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, fieldName)) {
            delete (restOfEntity as any)[fieldName];
          }

          const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);
          const newSubEntities = (restOfEntity as any)[fieldName];

          if (isArrayType && isEntityTypeName(baseTypeName) && newSubEntities) {
            if (typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, fieldName)) {
              (restOfEntity as any)[fieldName] = newSubEntities.map((subEntity: any) => subEntity._id);
            } else {
              handleNestedManyToManyRelations(restOfEntity, Types, (Types as any)[baseTypeName], fieldName);
              handleNestedOneToManyRelations(restOfEntity, Types, (Types as any)[baseTypeName], fieldName);
            }
          } else if (fieldName !== '_id') {
            if (fieldName === 'version') {
              (restOfEntity as any)[fieldName] =
                (currentEntity?.data.version ?? (restOfEntity as any).version) + 1;
            } else if (fieldName === 'lastModifiedTimestamp') {
              (restOfEntity as any)[fieldName] = new Date();
            }
          }
        });

        const updateOperationResult = await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .updateOne({ _id: new ObjectId(_id) }, { $set: restOfEntity });

        if (updateOperationResult.matchedCount !== 1) {
          return [
            null,
            createBackkErrorFromErrorCodeMessageAndStatus({
              ...BACKK_ERRORS.ENTITY_NOT_FOUND,
              message: EntityClass.name + ' with id: ' + _id + ' not found'
            })
          ];
        }

        if (!isRecursiveCall && options?.postHook) {
          await tryExecutePostHook(options.postHook, null);
        }

        return [null, null];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    let matchExpression: any;
    let finalFilters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlExpression)) {
      throw new Error('SqlExpression is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbQuery<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression
      };

      replaceIdStringsWithObjectIds(matchExpression);
    }

    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
      let versionUpdate = {};
      if (entityPropertyNameToPropertyTypeNameMap.version) {
        delete (entityUpdate as any).version;
        // noinspection ReuseOfLocalVariableJS
        versionUpdate = { $inc: { version: 1 } };
      }

      let lastModifiedTimestampUpdate = {};
      if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
        delete (entityUpdate as any).lastModifiedTimestamp;
        lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
      }

      await this.tryExecute(shouldUseTransaction, async (client) => {
        const [currentEntity, error] = await this.getEntityByFilters(
          EntityClass,
          filters,
          options?.postQueryOperations ?? new DefaultPostQueryOperations(),
          false,
          undefined,
          true,
          true
        );

        if (!currentEntity) {
          return [null, error];
        }

        await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);

        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .updateMany(matchExpression, {
            ...versionUpdate,
            ...lastModifiedTimestampUpdate,
            $set: entityUpdate
          });

        if (options?.postHook) {
          await tryExecutePostHook(options.postHook, null);
        }
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async updateEntitiesByFilters<T extends object>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    entityUpdate: Partial<T>
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntityByFilters');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    let matchExpression: any;
    let finalFilters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlExpression)) {
      throw new Error('SqlExpression is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbQuery<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression
      };

      replaceIdStringsWithObjectIds(matchExpression);
    }

    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
      let versionUpdate = {};
      if (entityPropertyNameToPropertyTypeNameMap.version) {
        delete (entityUpdate as any).version;
        // noinspection ReuseOfLocalVariableJS
        versionUpdate = { $inc: { version: 1 } };
      }

      let lastModifiedTimestampUpdate = {};
      if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
        delete (entityUpdate as any).lastModifiedTimestamp;
        lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
      }

      await this.tryExecute(shouldUseTransaction, async (client) => {
        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .updateMany(matchExpression, {
            ...versionUpdate,
            ...lastModifiedTimestampUpdate,
            $set: entityUpdate
          });
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      await this.tryExecute(shouldUseTransaction, async (client) => {
        if (options?.entityPreHooks) {
          const [currentEntity, error] = await this.getEntityById(
            EntityClass,
            _id,
            options?.postQueryOperations ?? new DefaultPostQueryOperations(),
            false,
            undefined,
            true,
            true
          );

          if (!currentEntity) {
            return [null, error];
          }

          await tryExecuteEntityPreHooks(options?.entityPreHooks, currentEntity);
        }

        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .deleteOne({ _id: new ObjectId(_id) });

        if (options?.postHook) {
          await tryExecutePostHook(options?.postHook, null);
        }
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async deleteEntitiesByField<T extends object>(
    EntityClass: { new (): T },
    fieldName: keyof T & string,
    fieldValue: T[keyof T] | string
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByField');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      const lastFieldNamePart = fieldName.slice(fieldName.lastIndexOf('.') + 1);
      if (!shouldUseRandomInitializationVector(lastFieldNamePart) && shouldEncryptValue(lastFieldNamePart)) {
        // noinspection AssignmentToFunctionParameterJS
        fieldValue = encrypt(fieldValue as any, false);
      }

      await this.tryExecute(shouldUseTransaction, async (client) => {
        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .deleteOne({ [fieldName]: fieldValue });
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByFilters');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;
    let matchExpression: any;
    let finalFilters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlExpression)) {
      throw new Error('SqlExpression is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbQuery<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression
      };
    }

    replaceIdStringsWithObjectIds(matchExpression);

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      await this.tryExecute(shouldUseTransaction, async (client) => {
        if (options?.entityPreHooks) {
          const [currentEntity, error] = await this.getEntityByFilters(
            EntityClass,
            filters,
            options?.postQueryOperations ?? new DefaultPostQueryOperations(),
            false,
            undefined,
            true,
            true
          );

          if (!currentEntity) {
            return [null, error];
          }

          await tryExecuteEntityPreHooks(options?.entityPreHooks, currentEntity);
        }

        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .deleteOne(matchExpression);

        if (options?.postHook) {
          await tryExecutePostHook(options?.postHook, null);
        }
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async deleteEntitiesByFilters<T extends object>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByFilters');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;
    let matchExpression: any;
    let finalFilters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlExpression)) {
      throw new Error('SqlExpression is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbQuery<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression
      };
    }

    replaceIdStringsWithObjectIds(matchExpression);

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      await this.tryExecute(shouldUseTransaction, async (client) => {
        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .deleteMany(matchExpression);
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        const [currentEntity, error] = await this.getEntityById(
          EntityClass,
          _id,
          options?.postQueryOperations ?? new DefaultPostQueryOperations(),
          false,
          undefined,
          true,
          true
        );
        if (!currentEntity) {
          throw error;
        }

        await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
        const subEntities = JSONPath({ json: currentEntity, path: subEntitiesJsonPath });
        let updateError = null;

        if (subEntities.length > 0) {
          removeSubEntities(currentEntity, subEntities);
          [, updateError] = await this.updateEntity(EntityClass, currentEntity as any, undefined);
        }

        if (options?.postHook) {
          await tryExecutePostHook(options.postHook, null);
        }

        return [null, updateError];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    const isNonNestedColumnName = subEntitiesJsonPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
    let response;

    if (isNonNestedColumnName) {
      response = await removeSimpleSubEntityById(
        this,
        _id,
        subEntitiesJsonPath,
        subEntityId,
        EntityClass,
        options
      );
    } else {
      const subEntityPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
      response = await this.removeSubEntitiesByJsonPathFromEntityById(
        subEntityPath,
        EntityClass,
        _id,
        options
      );
    }

    recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    return response;
  }

  async deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteAllEntities');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      await this.tryExecute(shouldUseTransaction, async (client) => {
        await client
          .db(this.dbName)
          .collection(EntityClass.name.toLowerCase())
          .deleteMany({});
      });

      return [null, null];
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  tryReleaseDbConnectionBackToPool() {
    // No operation
  }

  async tryReserveDbConnectionFromPool(): Promise<void> {
    if (!this.mongoClient.isConnected()) {
      await this.mongoClient.connect();
    }
  }

  shouldConvertTinyIntegersToBooleans(): boolean {
    return false;
  }

  async removeSubEntitiesByJsonPathFromEntityByFilters<T extends BackkEntity, U extends object>(
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async () => {
        const [currentEntity] = await this.getEntityByFilters(
          EntityClass,
          filters,
          options?.postQueryOperations ?? new DefaultPostQueryOperations(),
          false,
          undefined,
          true,
          true
        );

        if (currentEntity) {
          await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
          const subEntities = JSONPath({ json: currentEntity, path: subEntitiesJsonPath });

          if (subEntities.length > 0) {
            removeSubEntities(currentEntity, subEntities);
            await this.updateEntity(EntityClass, currentEntity as any, undefined);
          }
        }

        if (options?.postHook) {
          await tryExecutePostHook(options?.postHook, null);
        }

        return [null, null];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    const isNonNestedColumnName = subEntitiesJsonPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
    let response;

    if (isNonNestedColumnName) {
      response = await removeSimpleSubEntityByIdFromEntityByFilters(
        this,
        filters,
        subEntitiesJsonPath,
        subEntityId,
        EntityClass,
        options
      );
    } else {
      const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
      response = await this.removeSubEntitiesByJsonPathFromEntityByFilters(
        subEntityJsonPath,
        EntityClass,
        filters,
        options
      );
    }

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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        return addSimpleSubEntitiesOrValuesByEntityId(
          client,
          this,
          _id,
          fieldName,
          fieldValues,
          EntityClass,
          options
        );
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }

  async doesEntityArrayFieldContainValue<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    fieldName: keyof T & string,
    fieldValue: string | number | boolean
  ): PromiseErrorOr<boolean> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addEntityArrayFieldValues');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    try {
      let isSelectForUpdate = false;

      if (
        getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
        this.getClsNamespace()?.get('globalTransaction') ||
        this.getClsNamespace()?.get('localTransaction')
      ) {
        // noinspection AssignmentToFunctionParameterJS
        isSelectForUpdate = true;
      }

      return await this.tryExecute(false, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.dbName)
            .collection(EntityClass.name.toLowerCase())
            .findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: { _backkLock: new ObjectId() } });
        }

        const cursor = client
          .db(this.dbName)
          .collection(getTableName(EntityClass.name))
          .find({ _id: new ObjectId(_id), [fieldName]: fieldValue });

        const rows = await cursor.toArray();

        if (rows.length >= 1) {
          return [true, null];
        }
        return [false, null];
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
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
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addEntityArrayFieldValues');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        return removeFieldValues(client, this, _id, fieldName, fieldValues, EntityClass, options);
      });
    } catch (errorOrBackkError) {
      return isBackkError(errorOrBackkError)
        ? [null, errorOrBackkError]
        : [null, createBackkErrorFromError(errorOrBackkError)];
    } finally {
      cleanupLocalTransactionIfNeeded(shouldUseTransaction, this);
      recordDbOperationDuration(this, dbOperationStartTimeInMillis);
    }
  }
}
