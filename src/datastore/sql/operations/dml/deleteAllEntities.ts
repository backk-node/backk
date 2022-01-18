import forEachAsyncParallel from "../../../../utils/forEachAsyncParallel";
import entityContainer, { EntityJoinSpec } from "../../../../decorators/entity/entityAnnotationContainer";
import AbstractSqlDataStore from "../../../AbstractSqlDataStore";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import tryStartLocalTransactionIfNeeded from "../transaction/tryStartLocalTransactionIfNeeded";
import tryCommitLocalTransactionIfNeeded from "../transaction/tryCommitLocalTransactionIfNeeded";
import tryRollbackLocalTransactionIfNeeded from "../transaction/tryRollbackLocalTransactionIfNeeded";
import cleanupLocalTransactionIfNeeded from "../transaction/cleanupLocalTransactionIfNeeded";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import getClassPropertyNameToPropertyTypeNameMap
  from "../../../../metadata/getClassPropertyNameToPropertyTypeNameMap";
import forEachAsyncSequential from "../../../../utils/forEachAsyncSequential";
import getTypeInfoForTypeName from "../../../../utils/type/getTypeInfoForTypeName";
import isEntityTypeName from "../../../../utils/type/isEntityTypeName";
import getUserAccountIdFieldNameAndRequiredValue
  from "../../../utils/getUserAccountIdFieldNameAndRequiredValue";

export default async function deleteAllEntities<T>(
  dataStore: AbstractSqlDataStore,
  EntityClass: new () => T,
  isRecursive = false
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    const Types = dataStore.getTypes();
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

    await forEachAsyncSequential(Object.entries(entityMetadata), async ([, fieldTypeName]: [any, any]) => {
      const { baseTypeName } = getTypeInfoForTypeName(fieldTypeName);

      if (isEntityTypeName(baseTypeName)) {
        await deleteAllEntities(dataStore, (Types as any)[baseTypeName], true);
      }
    });

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    const whereClause =
      userAccountIdFieldName && userAccountId !== undefined
        ? ` WHERE ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()}.${userAccountIdFieldName} = ${dataStore.getValuePlaceholder(
            1
          )}`
        : '';

    await Promise.all([
      forEachAsyncParallel(
        Object.values(entityContainer.entityNameToJoinsMap[EntityClass.name] || {}),
        async (joinSpec: EntityJoinSpec) => {
          if (!joinSpec.isReadonly) {
            await dataStore.executeSqlOrThrow(
              `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()}`
            );
          }
        }
      ),
      forEachAsyncParallel(entityContainer.manyToManyRelationTableSpecs, async ({ associationTableName }) => {
        if (associationTableName.startsWith(EntityClass.name + '_')) {
          await dataStore.executeSqlOrThrow(
            `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${associationTableName.toLowerCase()}`
          );
        }
      }),
      isRecursive
        ? Promise.resolve(undefined)
        : dataStore.executeSqlOrThrow(
            `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()}${whereClause}`,
            whereClause ? [userAccountId] : undefined
          )
    ]);

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [null, null];
  } catch (error) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [null, createBackkErrorFromError(error)];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dataStore);
  }
}
