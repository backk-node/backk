import hashAndEncryptEntity from '../../../../crypt/hashAndEncryptEntity';
import forEachAsyncParallel from '../../../../utils/forEachAsyncParallel';
import AbstractSqlDbManager from '../../../AbstractSqlDataStore';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getTypeInfoForTypeName from '../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../utils/type/isEntityTypeName';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import typePropertyAnnotationContainer from '../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';
import { PostHook } from '../../../hooks/PostHook';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import createErrorFromErrorCodeMessageAndStatus from '../../../../errors/createErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/BACKK_ERRORS';
import getSingularName from '../../../../utils/getSingularName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import isBackkError from '../../../../errors/isBackkError';
import { PreHook } from '../../../hooks/PreHook';
import tryExecutePreHooks from '../../../hooks/tryExecutePreHooks';
import { plainToClass } from 'class-transformer';
import { One } from '../../../DataStore';
import DefaultPostQueryOperationsImpl from '../../../../types/postqueryoperations/DefaultPostQueryOperationsImpl';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';
import throwIf from '../../../../utils/exception/throwIf';

export default async function createEntity<T extends BackkEntity>(
  dataStore: AbstractSqlDbManager,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
  EntityClass: new () => T,
  preHooks?: PreHook | PreHook[],
  postHook?: PostHook<T>,
  postQueryOperations?: PostQueryOperations,
  isRecursiveCall = false,
  shouldReturnItem = true
): PromiseErrorOr<One<T>> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;
  let sqlStatement;
  // noinspection AssignmentToFunctionParameterJS
  entity = plainToClass(EntityClass, entity);

  // noinspection ExceptionCaughtLocallyJS
  try {
    const Types = dataStore.getTypes();

    if (!isRecursiveCall) {
      await hashAndEncryptEntity(entity, EntityClass, Types);
    }

    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (!isRecursiveCall && userAccountIdFieldName  && userAccountId !== undefined && entity[userAccountIdFieldName] !== userAccountId) {
      throw createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED);
    }

    if (!isRecursiveCall) {
      await tryExecutePreHooks(preHooks ?? []);
    }

    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);
    const additionalMetadata = Object.keys(entity)
      .filter((itemKey) => itemKey.endsWith('Id'))
      .reduce((accumulatedMetadata, itemKey) => ({ ...accumulatedMetadata, [itemKey]: 'integer' }), {});
    const columns: any = [];
    const values: any = [];

    Object.entries({ ...entityMetadata, ...additionalMetadata }).forEach(
      ([fieldName, fieldTypeName]: [any, any]) => {
        if (typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, fieldName)) {
          return;
        }

        const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);

        if (!isArrayType && !isEntityTypeName(baseTypeName) && fieldName !== '_id') {
          columns.push(fieldName);

          if (
            (fieldName === 'id' || fieldName.endsWith('Id')) &&
            !typePropertyAnnotationContainer.isTypePropertyExternalId(EntityClass, fieldName) &&
            (entity as any)[fieldName] !== null
          ) {
            const numericId = parseInt((entity as any)[fieldName], 10);

            if (isNaN(numericId)) {
              throw createErrorFromErrorCodeMessageAndStatus({
                ...BACKK_ERRORS.INVALID_ARGUMENT,
                message:
                  BACKK_ERRORS.INVALID_ARGUMENT.message +
                  EntityClass.name +
                  '.' +
                  fieldName +
                  ': must be a numeric id'
              });
            }

            values.push(numericId);
          } else {
            if (fieldName === 'version') {
              values.push('1');
            } else if (fieldName === 'lastModifiedTimestamp' || fieldName === 'createdAtTimestamp') {
              values.push(new Date());
            } else {
              if ((entity as any)[fieldName] === undefined) {
                throw new Error(
                  EntityClass.name +
                    '.' +
                    fieldName +
                    " is a readonly field. Value must be provided for that field in backend call to DbManager's createEntity method."
                );
              }

              values.push((entity as any)[fieldName]);
            }
          }
        }
      }
    );

    const sqlColumns = columns.map((fieldName: any) => fieldName.toLowerCase()).join(', ');
    const sqlValuePlaceholders = columns
      .map((_: any, index: number) => dataStore.getValuePlaceholder(index + 1))
      .join(', ');

    const getIdSqlStatement = dataStore.getReturningIdClause('_id');
    sqlStatement = `INSERT INTO ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()} (${sqlColumns}) VALUES (${sqlValuePlaceholders}) ${getIdSqlStatement}`;
    const result = await dataStore.executeSqlQueryOrThrow(sqlStatement, values);
    const _id = dataStore.getInsertId(result, '_id')?.toString();

    await forEachAsyncParallel(
      Object.entries(entityMetadata),
      async ([fieldName, fieldTypeName]: [any, any]) => {
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);
        const foreignIdFieldName =
          EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';
        const subEntityOrEntities = (entity as any)[fieldName];

        if (isArrayType && isEntityTypeName(baseTypeName)) {
          await forEachAsyncParallel(subEntityOrEntities ?? [], async (subEntity: any, index) => {
            const SubEntityClass = (Types as any)[baseTypeName];

            if (typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, fieldName)) {
              const associationTableName = `${EntityClass.name}_${getSingularName(fieldName)}`;
              const {
                entityForeignIdFieldName,
                subEntityForeignIdFieldName
              } = entityAnnotationContainer.getManyToManyRelationTableSpec(associationTableName);

              await dataStore.executeSqlOrThrow(
                `INSERT INTO ${dataStore.getSchema().toLowerCase()}.${associationTableName.toLowerCase()} (${entityForeignIdFieldName.toLowerCase()}, ${subEntityForeignIdFieldName.toLowerCase()}) VALUES (${dataStore.getValuePlaceholder(
                  1
                )}, ${dataStore.getValuePlaceholder(2)})`,
                [_id, subEntity._id]
              );
            } else {
              subEntity[foreignIdFieldName] = _id;

              if (subEntity.id === undefined) {
                subEntity.id = index;
              } else {
                if (parseInt(subEntity.id, 10) !== index) {
                  throw createErrorFromErrorCodeMessageAndStatus({
                    ...BACKK_ERRORS.INVALID_ARGUMENT,
                    message:
                      BACKK_ERRORS.INVALID_ARGUMENT.message +
                      EntityClass.name +
                      '.' +
                      fieldName +
                      ': id values must be consecutive numbers starting from zero'
                  });
                }
              }

              const [, error] = await createEntity(
                dataStore,
                subEntity,
                SubEntityClass,
                preHooks,
                postHook,
                postQueryOperations,
                true,
                false
              );

              throwIf(error);
            }
          });
        } else if (isEntityTypeName(baseTypeName) && subEntityOrEntities !== null) {
          const relationEntityName = baseTypeName;
          subEntityOrEntities[foreignIdFieldName] = _id;

          const [, error] = await createEntity(
            dataStore,
            subEntityOrEntities,
            (Types as any)[relationEntityName],
            preHooks,
            postHook,
            postQueryOperations,
            true,
            false
          );

          throwIf(error);
        } else if (isArrayType) {
          await forEachAsyncParallel(
            (entity as any)[fieldName] ?? [],
            async (subItem: any, index: number) => {
              const insertStatement = `INSERT INTO ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase() +
                '_' +
                fieldName
                  .slice(0, -1)
                  .toLowerCase()} (id, ${foreignIdFieldName.toLowerCase()}, ${fieldName
                .slice(0, -1)
                .toLowerCase()}) VALUES(${index}, ${dataStore.getValuePlaceholder(
                1
              )}, ${dataStore.getValuePlaceholder(2)})`;

              await dataStore.executeSqlOrThrow(insertStatement, [_id, subItem]);
            }
          );
        }
      }
    );

    const [createdEntity, error] =
      isRecursiveCall || !shouldReturnItem
        ? [{ metadata: { currentPageTokens: undefined, entityCounts: undefined }, data: { _id } as T }, null]
        : await dataStore.getEntityById(
            EntityClass,
            _id,
            postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
            false
          );

    if (!isRecursiveCall && postHook) {
      await tryExecutePostHook(postHook, createdEntity);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [createdEntity, error];
  } catch (errorOrBackkError) {
    if (isRecursiveCall) {
      throw errorOrBackkError;
    }

    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dataStore);

    if (dataStore.isDuplicateEntityError(errorOrBackkError)) {
      return [
        null,
        createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.DUPLICATE_ENTITY,
          message: `Duplicate ${EntityClass.name.charAt(0).toLowerCase()}${EntityClass.name.slice(1)}`
        })
      ];
    }

    return [
      null,
      isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)
    ];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dataStore);
  }
}
