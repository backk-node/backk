import { JSONPath } from 'jsonpath-plus';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import forEachAsyncParallel from '../../../../utils/forEachAsyncParallel';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import findParentEntityAndPropertyNameForSubEntity from '../../../../metadata/findParentEntityAndPropertyNameForSubEntity';
import { MetadataStorage, getFromContainer } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded from './utils/tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded';
import typePropertyAnnotationContainer from '../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import { SubEntity } from '../../../../types/entities/SubEntity';
import getEntityById from '../dql/getEntityById';
import { PostHook } from '../../../hooks/PostHook';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/BACKK_ERRORS';
import getSingularName from '../../../../utils/getSingularName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import isBackkError from '../../../../errors/isBackkError';
import { EntityPreHook } from '../../../hooks/EntityPreHook';
import tryExecuteEntityPreHooks from '../../../hooks/tryExecuteEntityPreHooks';
import { HttpStatusCodes } from '../../../../constants/constants';
import findSubEntityClass from '../../../../utils/type/findSubEntityClass';
import { One } from '../../../DataStore';
import DefaultPostQueryOperationsImpl from '../../../../types/postqueryoperations/DefaultPostQueryOperationsImpl';
import throwIf from "../../../../utils/exception/throwIf";
import { getNamespace } from "cls-hooked";

// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
export default async function addSubEntities<T extends BackkEntity, U extends SubEntity>(
  dataStore: AbstractSqlDataStore,
  _id: string,
  subEntityPath: string,
  newSubEntities: Array<Omit<U, 'id'> | { _id: string }>,
  EntityClass: new () => T,
  options?: {
    ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
  }
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  // noinspection AssignmentToFunctionParameterJS
  const SubEntityClass = findSubEntityClass(subEntityPath, EntityClass, dataStore.getTypes());
  if (!SubEntityClass) {
    throw new Error('Invalid subEntityPath: ' + subEntityPath);
  }
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);

    let [currentEntity, error] = await getEntityById(
      dataStore,
      _id,
      EntityClass,
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
      throw error;
    }

    await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
    await tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded(dataStore, currentEntity, EntityClass);

    const maxSubItemId = JSONPath({ json: currentEntity, path: subEntityPath }).reduce(
      (maxSubItemId: number, subItem: any) => {
        const subItemId = parseInt(subItem.id);
        return subItemId > maxSubItemId ? subItemId : maxSubItemId;
      },
      -1
    );

    const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity(
      EntityClass,
      SubEntityClass,
      dataStore.getTypes()
    );

    // noinspection DuplicatedCode
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
        maxSubItemId + newSubEntities.length >= foundArrayMaxSizeValidation.constraints[0]
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

    const clsNamespace = getNamespace('serviceFunctionExecution');
    const userAccountId = clsNamespace?.get('userAccountId');
    clsNamespace?.set('userAccountId', undefined);

    await forEachAsyncParallel(newSubEntities, async (newSubEntity, index) => {
      if (
        parentEntityClassAndPropertyNameForSubEntity &&
        typePropertyAnnotationContainer.isTypePropertyManyToMany(
          parentEntityClassAndPropertyNameForSubEntity[0],
          parentEntityClassAndPropertyNameForSubEntity[1]
        )
      ) {
        const [subEntity, error] = await dataStore.getEntityById(
          SubEntityClass,
          newSubEntity._id ?? '',
          new DefaultPostQueryOperationsImpl(),
          false
        );

        if (!subEntity) {
          // noinspection ExceptionCaughtLocallyJS
          throw error;
        }

        const associationTable = `${EntityClass.name}_${getSingularName(
          parentEntityClassAndPropertyNameForSubEntity[1]
        )}`;

        const {
          entityForeignIdFieldName,
          subEntityForeignIdFieldName
        } = entityAnnotationContainer.getManyToManyRelationTableSpec(associationTable);

        await dataStore.executeSqlOrThrow(
          `INSERT INTO ${dataStore.getSchema().toLowerCase()}.${associationTable.toLowerCase()} (${entityForeignIdFieldName.toLowerCase()}, ${subEntityForeignIdFieldName.toLowerCase()}) VALUES (${dataStore.getValuePlaceholder(
            1
          )}, ${dataStore.getValuePlaceholder(2)})`,
          [currentEntity?.data._id, subEntity.data._id]
        );
      } else {
        const foreignIdFieldName = entityAnnotationContainer.getForeignIdFieldName(SubEntityClass.name);

        const [, error] = await dataStore.createEntity(
          SubEntityClass,
          {
            ...newSubEntity,
            [foreignIdFieldName]: currentEntity?.data._id,
            id: (maxSubItemId + 1 + index).toString()
          } as any,
          undefined,
          false
        );

        throwIf(error);
      }
    });

    clsNamespace?.set('userAccountId', userAccountId);

    if (options?.postHook) {
      await tryExecutePostHook(options?.postHook, null);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [null, null];
  } catch (errorOrBackkError) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [
      null,
      isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)
    ];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dataStore);
  }
}
