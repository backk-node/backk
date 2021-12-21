import { getFromContainer, MetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import { getNamespace } from 'cls-hooked';
import { JSONPath } from 'jsonpath-plus';
import { FilterQuery, MongoClient, ObjectId } from 'mongodb';
import { HttpStatusCodes } from '../constants/constants';
import decryptEntities from '../crypt/decryptEntities';
import hashAndEncryptEntity from '../crypt/hashAndEncryptEntity';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import { BACKK_ERRORS } from '../errors/BACKK_ERRORS';
import createBackkErrorFromError from '../errors/createBackkErrorFromError';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import createInternalServerError from '../errors/createInternalServerError';
import isBackkError from '../errors/isBackkError';
import findParentEntityAndPropertyNameForSubEntity from '../metadata/findParentEntityAndPropertyNameForSubEntity';
import getClassPropertyNameToPropertyTypeNameMap from '../metadata/getClassPropertyNameToPropertyTypeNameMap';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import { BackkEntity } from '../types/entities/BackkEntity';
import { SubEntity } from '../types/entities/SubEntity';
import EntityCountRequest from '../types/EntityCountRequest';
import { ErrorOr } from '../types/ErrorOr';
import DefaultPostQueryOperationsImpl from '../types/postqueryoperations/DefaultPostQueryOperationsImpl';
import { PostQueryOperations } from '../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../types/PromiseErrorOr';
import { RecursivePartial } from '../types/RecursivePartial';
import UserDefinedFilter from '../types/userdefinedfilters/UserDefinedFilter';
import throwException from '../utils/exception/throwException';
import forEachAsyncParallel from '../utils/forEachAsyncParallel';
import forEachAsyncSequential from '../utils/forEachAsyncSequential';
import getDbNameFromServiceName from '../utils/getDbNameFromServiceName';
import findSubEntityClass from '../utils/type/findSubEntityClass';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../utils/type/isEntityTypeName';
import AbstractDataStore from './AbstractDataStore';
import { Field, Many, One, QueryFilters } from './DataStore';
import { EntitiesPostHook } from './hooks/EntitiesPostHook';
import { EntityPreHook } from './hooks/EntityPreHook';
import { PostHook } from './hooks/PostHook';
import { PreHook } from './hooks/PreHook';
import tryExecuteEntityPreHooks from './hooks/tryExecuteEntityPreHooks';
import tryExecutePostHook from './hooks/tryExecutePostHook';
import tryExecutePreHooks from './hooks/tryExecutePreHooks';
import addSimpleSubEntitiesOrValuesByEntityId from './mongodb/addSimpleSubEntitiesOrValuesByEntityId';
import addSimpleSubEntitiesOrValuesByFilters from './mongodb/addSimpleSubEntitiesOrValuesByFilters';
import convertFilterObjectToMongoDbQueries from './mongodb/convertFilterObjectToMongoDbQueries';
import convertMongoDbQueriesToMatchExpression from './mongodb/convertMongoDbQueriesToMatchExpression';
import convertUserDefinedFiltersToMatchExpression from './mongodb/convertUserDefinedFiltersToMatchExpression';
import getFieldOrdering from './mongodb/getFieldOrdering';
import getJoinPipelines from './mongodb/getJoinPipelines';
import getRootOperations from './mongodb/getRootOperations';
import handleNestedManyToManyRelations from './mongodb/handleNestedManyToManyRelations';
import handleNestedOneToManyRelations from './mongodb/handleNestedOneToManyRelations';
import MongoDbFilter from './mongodb/MongoDbFilter';
import getEntitiesByFilters from './mongodb/operations/dql/getEntitiesByFilters';
import getEntityByFilters from './mongodb/operations/dql/getEntityByFilters';
import paginateSubEntities from './mongodb/paginateSubEntities';
import performPostQueryOperations from './mongodb/performPostQueryOperations';
import removeFieldValues from './mongodb/removeFieldValues';
import removePrivateProperties from './mongodb/removePrivateProperties';
import removeSimpleSubEntityById from './mongodb/removeSimpleSubEntityById';
import removeSimpleSubEntityByIdFromEntityByFilters from './mongodb/removeSimpleSubEntityByIdFromEntityByFilters';
import removeSubEntities from './mongodb/removeSubEntities';
import replaceIdStringsWithObjectIds from './mongodb/replaceIdStringsWithObjectIds';
import tryFetchAndAssignSubEntitiesForManyToManyRelationships from './mongodb/tryFetchAndAssignSubEntitiesForManyToManyRelationships';
import SqlFilter from './sql/filters/SqlFilter';
import updateDbLocalTransactionCount from './sql/operations/dql/utils/updateDbLocalTransactionCount';
import cleanupLocalTransactionIfNeeded from './sql/operations/transaction/cleanupLocalTransactionIfNeeded';
import tryStartLocalTransactionIfNeeded from './sql/operations/transaction/tryStartLocalTransactionIfNeeded';
import createCurrentPageTokens from './utils/createCurrentPageTokens';
import getTableName from './utils/getTableName';
import getUserAccountIdFieldNameAndRequiredValue from './utils/getUserAccountIdFieldNameAndRequiredValue';
import recordDbOperationDuration from './utils/recordDbOperationDuration';
import startDbOperation from './utils/startDbOperation';
import tryEnsurePreviousOrNextPageIsRequested from './utils/tryEnsurePreviousOrNextPageIsRequested';

export default class MongoDbDataStore extends AbstractDataStore {
  private readonly uri: string;
  private mongoClient: MongoClient;
  private lastInitError: Error | undefined = undefined;

  constructor() {
    super('', getDbNameFromServiceName());

    const MONGODB_HOST =
      process.env.MONGODB_HOST || throwException('MONGODB_HOST environment variable must be defined');

    const MONGODB_PORT =
      process.env.MONGODB_PORT || throwException('MONGODB_PORT environment variable must be defined');

    const MONGODB_USER =
      process.env.MONGODB_USER ||
      (process.env.NODE_ENV === 'production'
        ? throwException('MONGODB_USER environment variable must be defined')
        : '');

    const MONGODB_PASSWORD =
      process.env.MONGODB_PASSWORD ||
      (process.env.NODE_ENV === 'production'
        ? throwException('MONGODB_PASSWORD environment variable must be defined')
        : '');

    if (MONGODB_USER && MONGODB_PASSWORD) {
      this.uri = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`;
    } else {
      this.uri = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}`;
    }

    if (process.env.MONGODB_TLS_CA_FILE_PATH_NAME) {
      this.uri += '?tls=true';
    }

    this.mongoClient = new MongoClient(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tlsCAFile: process.env.MONGODB_TLS_CA_FILE_PATH_NAME,
      tlsCertificateKeyFile: process.env.MONGODB_TLS_CERT_KEY_FILE_PATH_NAME,
    });
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
    mongoDbFilters: Array<MongoDbFilter<T>> | FilterQuery<T> | Partial<T> | object
  ): Array<MongoDbFilter<T> | SqlFilter> | Partial<T> | object {
    return Array.isArray(mongoDbFilters) ? mongoDbFilters : [new MongoDbFilter(mongoDbFilters)];
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

  getLastInitError(): Error | undefined {
    return this.lastInitError;
  }

  async isDbReady(): Promise<boolean> {
    try {
      await this.tryReserveDbConnectionFromPool();

      await this.tryExecute(false, (client) =>
        client.db(this.getDbName()).collection('__backk__').findOne({})
      );

      return true;
    } catch (error) {
      this.lastInitError = error;
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
    this.getClsNamespace()?.get('session')?.endSession();
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

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);
      if (
        userAccountIdFieldName &&
        userAccountId !== undefined &&
        entity[userAccountIdFieldName] !== userAccountId
      ) {
        throw createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED);
      }

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
            .db(this.getDbName())
            .collection(EntityClass.name.toLowerCase())
            .insertOne(entity);
        } catch (error) {
          if (error.message.startsWith('E11000 duplicate key error')) {
            return [
              null,
              createBackkErrorFromErrorCodeMessageAndStatus({
                ...BACKK_ERRORS.DUPLICATE_ENTITY,
                message: `Duplicate ${EntityClass.name.charAt(0).toLowerCase()}${EntityClass.name.slice(1)}`,
              }),
            ];
          }

          throw error;
        }

        const _id = createEntityResult?.insertedId.toHexString();

        const [createdEntity, error] = isInternalCall
          ? [
              { metadata: { currentPageTokens: undefined, entityCounts: undefined }, data: { _id } as T },
              null,
            ]
          : await this.getEntityById(
              EntityClass,
              _id,
              options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
    filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | Partial<T> | object,
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
            options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
            path: subEntityPath + '^',
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
                  BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message,
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
                id: (maxSubItemId + 1 + index).toString(),
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
    filters: QueryFilters<T>,
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
            options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
            path: subEntityPath + '^',
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
                  BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message,
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
                id: (maxSubItemId + 1 + index).toString(),
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

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);
      const filter =
        userAccountIdFieldName && userAccountId !== undefined
          ? {
              [userAccountIdFieldName]:
                userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId,
            }
          : {};

      const entities = await this.tryExecute(false, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.getDbName())
            .collection(EntityClass.name.toLowerCase())
            .updateMany({}, { $set: { _backkLock: new ObjectId() } });
        }

        const joinPipelines = getJoinPipelines(EntityClass, this.getTypes());

        const cursor = client
          .db(this.getDbName())
          .collection<T>(getTableName(EntityClass.name))
          .aggregate([...joinPipelines, getFieldOrdering(EntityClass)])
          .match(filter);

        performPostQueryOperations(cursor, postQueryOperations, EntityClass, this.getTypes());

        const shouldReturnRootEntityCount = !!entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
        );

        const [rows, count] = await Promise.all([
          cursor.toArray(),
          shouldReturnRootEntityCount
            ? client.db(this.getDbName()).collection<T>(getTableName(EntityClass.name)).countDocuments({})
            : Promise.resolve(undefined),
        ]);

        if (count !== undefined) {
          rows.forEach((row: any) => {
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
              : undefined,
          },
          data: entities,
        },
        null,
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
    filters: QueryFilters<T>,
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
    filters: QueryFilters<T>,
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
    filters?: QueryFilters<T>
  ): PromiseErrorOr<number> {
    let matchExpression: object;
    let finalFilters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else if (filters) {
      finalFilters = filters;
    } else {
      finalFilters = [];
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlFilter)) {
      throw new Error('SqlFilter is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbFilter));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbFilter);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        EntityClass,
        this.getTypes(),
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbFilter<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression,
      };
    }

    replaceIdStringsWithObjectIds(matchExpression);

    const dbOperationStartTimeInMillis = startDbOperation(this, 'getEntityCount');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);
    if (userAccountIdFieldName && userAccountId !== undefined) {
      (matchExpression as any)[userAccountIdFieldName] =
        userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId;
    }

    try {
      const entityCount = await this.tryExecute(false, async (client) => {
        return client
          .db(this.getDbName())
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
            data: { _id } as unknown as T,
          },
          null,
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

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);

      let filter = { _id: new ObjectId(_id) };
      if (userAccountIdFieldName && userAccountId !== undefined) {
        if (userAccountIdFieldName === '_id') {
          filter = { ...filter, [userAccountIdFieldName]: new ObjectId(userAccountId) };
        } else {
          filter = { ...filter, [userAccountIdFieldName]: userAccountId };
        }
      }

      const entities = await this.tryExecute(shouldUseTransaction, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.getDbName())
            .collection(EntityClass.name.toLowerCase())
            .findOneAndUpdate(filter, { $set: { _backkLock: new ObjectId() } });
        }

        if (options?.preHooks) {
          await tryExecutePreHooks(options.preHooks);
        }

        const joinPipelines = getJoinPipelines(EntityClass, this.getTypes());

        const cursor = client
          .db(this.getDbName())
          .collection<T>(getTableName(EntityClass.name))
          .aggregate([...joinPipelines, getFieldOrdering(EntityClass)])
          .match(filter);

        performPostQueryOperations(cursor, postQueryOperations, EntityClass, this.getTypes());

        const shouldReturnRootEntityCount = !!options?.entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
        );

        const [rows, count] = await Promise.all([
          cursor.toArray(),
          shouldReturnRootEntityCount
            ? client
                .db(this.getDbName())
                .collection<T>(getTableName(EntityClass.name))
                .countDocuments({ _id: new ObjectId(_id) } as object)
            : Promise.resolve(undefined),
        ]);

        if (count !== undefined) {
          rows.forEach((row: any) => {
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
            : undefined,
        },
        data: entities[0],
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
              message: `${EntityClass.name} with _id: ${_id} not found`,
            }),
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

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);

      let filter = { _id: { $in: _ids.map((_id: string) => new ObjectId(_id)) } };
      if (userAccountIdFieldName && userAccountId !== undefined) {
        filter = {
          ...filter,
          [userAccountIdFieldName]:
            userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId,
        };
      }

      const entities = await this.tryExecute(false, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.getDbName())
            .collection(EntityClass.name.toLowerCase())
            .updateMany(filter, { $set: { _backkLock: new ObjectId() } });
        }

        const joinPipelines = getJoinPipelines(EntityClass, this.getTypes());
        const cursor = client
          .db(this.getDbName())
          .collection<T>(getTableName(EntityClass.name))
          .aggregate([...joinPipelines, getFieldOrdering(EntityClass)])
          .match(filter);

        performPostQueryOperations(cursor, postQueryOperations, EntityClass, this.getTypes());

        const shouldReturnRootEntityCount = !!entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
        );

        const [rows, count] = await Promise.all([
          cursor.toArray(),
          shouldReturnRootEntityCount
            ? client
                .db(this.getDbName())
                .collection<T>(getTableName(EntityClass.name))
                .countDocuments({ _id: { $in: _ids.map((_id: string) => new ObjectId(_id)) } } as object)
            : Promise.resolve(undefined),
        ]);

        if (count !== undefined) {
          rows.forEach((row: any) => {
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
              : undefined,
          },
          data: entities,
        },
        null,
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
            options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
                error: BACKK_ERRORS.ENTITY_VERSION_MISMATCH,
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
                error: BACKK_ERRORS.ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH,
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
          .db(this.getDbName())
          .collection(EntityClass.name.toLowerCase())
          .updateOne({ _id: new ObjectId(_id) }, { $set: restOfEntity });

        if (updateOperationResult.matchedCount !== 1) {
          return [
            null,
            createBackkErrorFromErrorCodeMessageAndStatus({
              ...BACKK_ERRORS.ENTITY_NOT_FOUND,
              message: EntityClass.name + ' with id: ' + _id + ' not found',
            }),
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
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>,
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
    let finalFilters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlFilter)) {
      throw new Error('SqlFilter is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbFilter));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbFilter);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        EntityClass,
        this.getTypes(),
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbFilter<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression,
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
          options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
          .db(this.getDbName())
          .collection(EntityClass.name.toLowerCase())
          .updateMany(matchExpression, {
            ...versionUpdate,
            ...lastModifiedTimestampUpdate,
            $set: entityUpdate,
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
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'updateEntityByFilters');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);

    let matchExpression: any;
    let finalFilters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlFilter)) {
      throw new Error('SqlFilter is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbFilter));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbFilter);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        EntityClass,
        this.getTypes(),
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbFilter<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression,
      };

      replaceIdStringsWithObjectIds(matchExpression);
    }

    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);
      if (userAccountIdFieldName && userAccountId !== undefined) {
        matchExpression[userAccountIdFieldName] =
          userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId;
      }

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
          .db(this.getDbName())
          .collection(EntityClass.name.toLowerCase())
          .updateMany(matchExpression, {
            ...versionUpdate,
            ...lastModifiedTimestampUpdate,
            $set: entityUpdate,
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
        const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);

        if (options?.entityPreHooks || (userAccountIdFieldName && userAccountId !== undefined)) {
          const [currentEntity, error] = await this.getEntityById(
            EntityClass,
            _id,
            options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
            false,
            undefined,
            true,
            true
          );

          if (!currentEntity) {
            return [null, error];
          }

          if (options?.entityPreHooks) {
            await tryExecuteEntityPreHooks(options?.entityPreHooks, currentEntity);
          }
        }

        await client
          .db(this.getDbName())
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;
    let matchExpression: any;
    let finalFilters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlFilter)) {
      throw new Error('SqlFilter is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbFilter));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbFilter);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        EntityClass,
        this.getTypes(),
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbFilter<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression,
      };
    }

    replaceIdStringsWithObjectIds(matchExpression);

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      await this.tryExecute(shouldUseTransaction, async (client) => {
        const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);

        if (options?.entityPreHooks || (userAccountIdFieldName && userAccountId !== undefined)) {
          const [currentEntity, error] = await this.getEntityByFilters(
            EntityClass,
            filters,
            options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
            false,
            undefined,
            true,
            true
          );

          if (!currentEntity) {
            return [null, error];
          }

          if (options?.entityPreHooks) {
            await tryExecuteEntityPreHooks(options?.entityPreHooks, currentEntity);
          }
        }

        await client
          .db(this.getDbName())
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
    filters: QueryFilters<T>
  ): PromiseErrorOr<null> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'deleteEntitiesByFilters');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;
    let matchExpression: any;
    let finalFilters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter>;

    if (typeof filters === 'object' && !Array.isArray(filters)) {
      finalFilters = convertFilterObjectToMongoDbQueries(filters);
    } else {
      finalFilters = filters;
    }

    if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlFilter)) {
      throw new Error('SqlFilter is not supported for MongoDB');
    } else {
      const rootFilters = getRootOperations(finalFilters, EntityClass, this.getTypes());
      const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbFilter));
      const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbFilter);

      const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
        EntityClass,
        this.getTypes(),
        rootUserDefinedFilters as UserDefinedFilter[]
      );

      const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
        rootMongoDbQueries as Array<MongoDbFilter<T>>
      );

      matchExpression = {
        ...userDefinedFiltersMatchExpression,
        ...mongoDbQueriesMatchExpression,
      };
    }

    replaceIdStringsWithObjectIds(matchExpression);

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);
      if (userAccountIdFieldName && userAccountId !== undefined) {
        matchExpression[userAccountIdFieldName] =
          userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId;
      }

      await this.tryExecute(shouldUseTransaction, async (client) => {
        await client
          .db(this.getDbName())
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        const [currentEntity, error] = await this.getEntityById(
          EntityClass,
          _id,
          options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
      response = await this.removeSubEntitiesFromEntityById(subEntityPath, EntityClass, _id, options);
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

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);
      const filter =
        userAccountIdFieldName && userAccountId !== undefined
          ? {
              [userAccountIdFieldName]:
                userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId,
            }
          : {};

      await this.tryExecute(shouldUseTransaction, async (client) => {
        await client.db(this.getDbName()).collection(EntityClass.name.toLowerCase()).deleteMany(filter);
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

  async removeSubEntitiesFromEntityByFilters<T extends BackkEntity, U extends object>(
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
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async () => {
        const [currentEntity] = await this.getEntityByFilters(
          EntityClass,
          filters,
          options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
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
      response = await this.removeSubEntitiesFromEntityByFilters(
        subEntityJsonPath,
        EntityClass,
        filters,
        options
      );
    }

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
          fieldValuesToAdd,
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

  async doesArrayFieldContainValueInEntityById<T extends BackkEntity>(
    fieldName: keyof T & string,
    fieldValue: string | number | boolean,
    EntityClass: { new (): T },
    _id: string
  ): PromiseErrorOr<boolean> {
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addArrayFieldValuesToEntityById');
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

      const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(this);

      let filter = { _id: new ObjectId(_id), [fieldName]: fieldValue };
      if (userAccountIdFieldName && userAccountId !== undefined) {
        filter = {
          ...filter,
          [userAccountIdFieldName]:
            userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId,
        };
      }

      return await this.tryExecute(false, async (client) => {
        if (isSelectForUpdate) {
          await client
            .db(this.getDbName())
            .collection(EntityClass.name.toLowerCase())
            .findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: { _backkLock: new ObjectId() } });
        }

        const cursor = client.db(this.getDbName()).collection(getTableName(EntityClass.name)).find(filter);

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
    const dbOperationStartTimeInMillis = startDbOperation(this, 'addArrayFieldValuesToEntityById');
    // noinspection AssignmentToFunctionParameterJS
    EntityClass = this.getType(EntityClass);
    let shouldUseTransaction = false;

    try {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(this);

      return await this.tryExecute(shouldUseTransaction, async (client) => {
        return removeFieldValues(client, this, _id, fieldName, fieldValuesToRemove, EntityClass, options);
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
