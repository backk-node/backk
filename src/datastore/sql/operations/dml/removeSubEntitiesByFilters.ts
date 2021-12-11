import { JSONPath } from "jsonpath-plus";
import { plainToClass } from "class-transformer";
import forEachAsyncParallel from "../../../../utils/forEachAsyncParallel";
import AbstractSqlDataStore from "../../../AbstractSqlDataStore";
import deleteEntityById from "./deleteEntityById";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import tryStartLocalTransactionIfNeeded from "../transaction/tryStartLocalTransactionIfNeeded";
import tryCommitLocalTransactionIfNeeded from "../transaction/tryCommitLocalTransactionIfNeeded";
import tryRollbackLocalTransactionIfNeeded from "../transaction/tryRollbackLocalTransactionIfNeeded";
import cleanupLocalTransactionIfNeeded from "../transaction/cleanupLocalTransactionIfNeeded";
import tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded
  from "./utils/tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded";
import entityAnnotationContainer from "../../../../decorators/entity/entityAnnotationContainer";
import findParentEntityAndPropertyNameForSubEntity
  from "../../../../metadata/findParentEntityAndPropertyNameForSubEntity";
import typePropertyAnnotationContainer
  from "../../../../decorators/typeproperty/typePropertyAnnotationContainer";
import { PostHook } from "../../../hooks/PostHook";
import tryExecutePostHook from "../../../hooks/tryExecutePostHook";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import getSingularName from "../../../../utils/getSingularName";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import isBackkError from "../../../../errors/isBackkError";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import tryExecuteEntityPreHooks from "../../../hooks/tryExecuteEntityPreHooks";
import MongoDbFilter from "../../../mongodb/MongoDbFilter";
import SqlFilter from "../../expressions/SqlFilter";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import getEntityByFilters from "../dql/getEntityByFilters";
import DefaultPostQueryOperationsImpl from "../../../../types/postqueryoperations/DefaultPostQueryOperationsImpl";
import throwIf from "../../../../utils/exception/throwIf";
import { getNamespace } from "cls-hooked";

export default async function removeSubEntitiesByFilters<T extends BackkEntity, U extends object>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | Partial<T> | object,
  subEntitiesJsonPath: string,
  EntityClass: new () => T,
  entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[],
  postHook?: PostHook<T>,
  postQueryOperations?: PostQueryOperations
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);

    const [currentEntity] = await getEntityByFilters(
      dataStore,
      filters,
      EntityClass,
      postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
    false,
    undefined,
      true,
      true
    );

    if (currentEntity) {
      await tryExecuteEntityPreHooks(entityPreHooks ?? [], currentEntity);
      await tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded(dataStore, currentEntity, EntityClass);
      const currentEntityInstance = plainToClass(EntityClass, currentEntity.data);
      const subEntities = JSONPath({ json: currentEntityInstance, path: subEntitiesJsonPath });

      const clsNamespace = getNamespace('serviceFunctionExecution');
      const userAccountId = clsNamespace?.get('userAccountId');
      clsNamespace?.set('userAccountId', undefined);

      await forEachAsyncParallel(subEntities, async (subEntity: any) => {
        const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity(
          EntityClass,
          subEntity.constructor,
          dataStore.getTypes()
        );

        if (
          parentEntityClassAndPropertyNameForSubEntity &&
          typePropertyAnnotationContainer.isTypePropertyManyToMany(
            parentEntityClassAndPropertyNameForSubEntity[0],
            parentEntityClassAndPropertyNameForSubEntity[1]
          )
        ) {
          const associationTableName = `${EntityClass.name}_${getSingularName(
            parentEntityClassAndPropertyNameForSubEntity[1]
          )}`;

          const {
            entityForeignIdFieldName,
            subEntityForeignIdFieldName
          } = entityAnnotationContainer.getManyToManyRelationTableSpec(associationTableName);

          const numericId = parseInt(currentEntity.data._id, 10);

          await dataStore.tryExecuteSql(
            `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} = ${dataStore.getValuePlaceholder(
              1
            )} AND ${subEntityForeignIdFieldName.toLowerCase()} = ${dataStore.getValuePlaceholder(2)}`,
            [numericId, subEntity._id]
          );
        } else {
          const [, error] = await deleteEntityById(dataStore, subEntity._id, subEntity.constructor);
          throwIf(error);
        }
      });

      clsNamespace?.set('userAccountId', userAccountId);
    }

    if (postHook) {
      await tryExecutePostHook(postHook, null);
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
