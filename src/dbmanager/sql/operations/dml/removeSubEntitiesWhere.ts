import { JSONPath } from 'jsonpath-plus';
import { plainToClass } from 'class-transformer';
import forEachAsyncParallel from '../../../../utils/forEachAsyncParallel';
import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import deleteEntityById from './deleteEntityById';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded from './utils/tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';
import findParentEntityAndPropertyNameForSubEntity from '../../../../metadata/findParentEntityAndPropertyNameForSubEntity';
import typePropertyAnnotationContainer from '../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import { PostHook } from '../../../hooks/PostHook';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSingularName from '../../../../utils/getSingularName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import isBackkError from '../../../../errors/isBackkError';
import { EntityPreHook } from '../../../hooks/EntityPreHook';
import tryExecuteEntityPreHooks from '../../../hooks/tryExecuteEntityPreHooks';
import getEntityWhere from '../dql/getEntityWhere';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import SqlExpression from '../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import getEntityByFilters from '../dql/getEntityByFilters';

export default async function removeSubEntitiesByFilters<T extends BackkEntity, U extends object>(
  dbManager: AbstractSqlDbManager,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
  subEntitiesJsonPath: string,
  EntityClass: new () => T,
  entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[],
  postHook?: PostHook<T>,
  postQueryOperations?: PostQueryOperations
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dbManager);

    const [currentEntity] = await getEntityByFilters(
      dbManager,
      filters,
      EntityClass,
      { postQueryOperations },
      true,
      true
    );

    if (currentEntity) {
      await tryExecuteEntityPreHooks(entityPreHooks ?? [], currentEntity);
      await tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded(dbManager, currentEntity, EntityClass);
      const currentEntityInstance = plainToClass(EntityClass, currentEntity);
      const subEntities = JSONPath({ json: currentEntityInstance, path: subEntitiesJsonPath });

      await forEachAsyncParallel(subEntities, async (subEntity: any) => {
        const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity(
          EntityClass,
          subEntity.constructor,
          dbManager.getTypes()
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

          const numericId = parseInt(currentEntity._id, 10);

          await dbManager.tryExecuteSql(
            `DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(
              1
            )} AND ${subEntityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(2)}`,
            [numericId, subEntity._id]
          );
        } else {
          const [, error] = await deleteEntityById(dbManager, subEntity._id, subEntity.constructor);

          if (error) {
            throw error;
          }
        }
      });
    }

    if (postHook) {
      await tryExecutePostHook(postHook, null);
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
