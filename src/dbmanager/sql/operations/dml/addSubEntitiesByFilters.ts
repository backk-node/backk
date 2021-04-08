import { JSONPath } from "jsonpath-plus";
import entityAnnotationContainer from "../../../../decorators/entity/entityAnnotationContainer";
import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import forEachAsyncParallel from "../../../../utils/forEachAsyncParallel";
import tryStartLocalTransactionIfNeeded from "../transaction/tryStartLocalTransactionIfNeeded";
import tryCommitLocalTransactionIfNeeded from "../transaction/tryCommitLocalTransactionIfNeeded";
import tryRollbackLocalTransactionIfNeeded from "../transaction/tryRollbackLocalTransactionIfNeeded";
import cleanupLocalTransactionIfNeeded from "../transaction/cleanupLocalTransactionIfNeeded";
import findParentEntityAndPropertyNameForSubEntity
  from "../../../../metadata/findParentEntityAndPropertyNameForSubEntity";
import { getFromContainer, MetadataStorage } from "class-validator";
import { ValidationMetadata } from "class-validator/metadata/ValidationMetadata";
import tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded
  from "./utils/tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded";
import typePropertyAnnotationContainer
  from "../../../../decorators/typeproperty/typePropertyAnnotationContainer";
import { SubEntity } from "../../../../types/entities/SubEntity";
import { PostHook } from "../../../hooks/PostHook";
import tryExecutePostHook from "../../../hooks/tryExecutePostHook";
import createBackkErrorFromErrorCodeMessageAndStatus
  from "../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../../../../errors/backkErrors";
import getSingularName from "../../../../utils/getSingularName";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import isBackkError from "../../../../errors/isBackkError";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import tryExecuteEntityPreHooks from "../../../hooks/tryExecuteEntityPreHooks";
import { HttpStatusCodes } from "../../../../constants/constants";
import findSubEntityClass from "../../../../utils/type/findSubEntityClass";
import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import SqlExpression from "../../expressions/SqlExpression";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import getEntityByFilters from "../dql/getEntityByFilters";

// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
export default async function addSubEntitiesByFilters<T extends BackkEntity, U extends SubEntity>(
  dbManager: AbstractSqlDbManager,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
  subEntityPath: string,
  newSubEntities: Array<Omit<U, 'id'> | { _id: string }>,
  EntityClass: new () => T,
  options?: {
    ifEntityNotFoundUse?: () => PromiseErrorOr<T>;
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
  }
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);
  const SubEntityClass = findSubEntityClass(subEntityPath, EntityClass, dbManager.getTypes());
  if (!SubEntityClass) {
    throw new Error('Invalid subEntityPath: ' + subEntityPath);
  }
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dbManager);

    let [currentEntity, error] = await getEntityByFilters(
      dbManager,
      filters,
      EntityClass,
      { postQueryOperations: options?.postQueryOperations },
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
    await tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded(dbManager, currentEntity, EntityClass);

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
      dbManager.getTypes()
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

    await forEachAsyncParallel(newSubEntities, async (newSubEntity, index) => {
      if (
        parentEntityClassAndPropertyNameForSubEntity &&
        typePropertyAnnotationContainer.isTypePropertyManyToMany(
          parentEntityClassAndPropertyNameForSubEntity[0],
          parentEntityClassAndPropertyNameForSubEntity[1]
        )
      ) {
        const [subEntity, error] = await dbManager.getEntityById(SubEntityClass, newSubEntity._id ?? '');

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

        await dbManager.tryExecuteSql(
          `INSERT INTO ${dbManager.schema.toLowerCase()}.${associationTable.toLowerCase()} (${entityForeignIdFieldName.toLowerCase()}, ${subEntityForeignIdFieldName.toLowerCase()}) VALUES (${dbManager.getValuePlaceholder(
            1
          )}, ${dbManager.getValuePlaceholder(2)})`,
          [currentEntity?._id, subEntity._id]
        );
      } else {
        const foreignIdFieldName = entityAnnotationContainer.getForeignIdFieldName(SubEntityClass.name);

        const [, error] = await dbManager.createEntity(
          SubEntityClass,
          {
            ...newSubEntity,
            [foreignIdFieldName]: currentEntity?._id,
            id: (maxSubItemId + 1 + index).toString()
          } as any,
          undefined
        );

        if (error) {
          // noinspection ExceptionCaughtLocallyJS
          throw error;
        }
      }
    });

    if (options?.postHook) {
      await tryExecutePostHook(options?.postHook, null);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dbManager);
    return [null, null];
  } catch (errorOrBackkError) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dbManager);
    return [
      null,
      isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)
    ];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dbManager);
  }
}
