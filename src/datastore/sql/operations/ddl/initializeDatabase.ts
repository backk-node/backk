import getClsNamespace from '../../../../continuationlocalstorage/getClsNamespace';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';
import tryExecuteOnStartUpTasks from '../../../../initialization/tryExecuteOnStartupTasks';
import log, { logError, Severity } from '../../../../observability/logging/log';
import tryInitializeCronJobSchedulingTable from '../../../../scheduling/tryInitializeCronJobSchedulingTable';
import forEachAsyncSequential from '../../../../utils/forEachAsyncSequential';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import { DataStore } from '../../../DataStore';
import setJoinSpecs from '../../../mongodb/setJoinSpecs';
import tryCreateMongoDbIndex from '../../../mongodb/tryCreateMongoDbIndex';
import tryCreateMongoDbIndexesForUniqueFields from '../../../mongodb/tryCreateMongoDbIndexesForUniqueFields';
import MongoDbDataStore from '../../../MongoDbDataStore';
import removeDbInitialization from './removeDbInitialization';
import removeDbInitializationWhenPendingTooLong from './removeDbInitializationWhenPendingTooLong';
import setDbInitialized from './setDbInitialized';
import shouldInitializeDb from './shouldInitializeDb';
import tryAlterOrCreateTable from './tryAlterOrCreateTable';
import tryCreateIndex from './tryCreateIndex';
import tryCreateUniqueIndex from './tryCreateUniqueIndex';

let isMongoDBInitialized = false;

export async function isDbInitialized(dataStore: DataStore) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (dataStore instanceof MongoDbDataStore) {
    return isMongoDBInitialized;
  }

  if (dataStore instanceof AbstractSqlDataStore) {
    await removeDbInitializationWhenPendingTooLong(dataStore);

    const getAppVersionInitializationStatusSql = `SELECT * ${dataStore
      .getSchema()
      .toLowerCase()}.__backk_db_initialization WHERE isinitialized = 1 AND microserviceversion = ?`;

    try {
      const clsNamespace = getClsNamespace('serviceFunctionExecution');
      return await clsNamespace.runAndReturn(async () => {
        await dataStore.tryReserveDbConnectionFromPool();
        const result = await dataStore.tryExecuteQuery(getAppVersionInitializationStatusSql, [
          process.env.MICROSERVICE_VERSION,
        ]);
        const rows = dataStore.getResultRows(result);
        return rows.length === 1;
      });
    } catch (error) {
      return false;
    } finally {
      dataStore.tryReleaseDbConnectionBackToPool();
    }
  }

  return false;
}

export default async function initializeDatabase(
  microservice: any | undefined,
  dataStore: DataStore
): Promise<boolean> {
  if (!(await dataStore.isDbReady())) {
    return false;
  }

  if (!microservice) {
    return false;
  }

  try {
    if (dataStore instanceof AbstractSqlDataStore) {
      if (await shouldInitializeDb(dataStore)) {
        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.entityNameToClassMap),
          async ([entityName, entityClass]: [any, any]) =>
            tryAlterOrCreateTable(dataStore, entityName, entityClass, dataStore.getSchema())
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.indexNameToIndexFieldsMap),
          async ([indexName, indexFields]: [any, any]) =>
            tryCreateIndex(dataStore, indexName, dataStore.getSchema(), indexFields)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.indexNameToUniqueIndexFieldsMap),
          async ([indexName, indexFields]: [any, any]) =>
            tryCreateUniqueIndex(dataStore, indexName, dataStore.getSchema(), indexFields)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.entityNameToForeignIdFieldNamesMap),
          async ([entityName, foreignIdFieldNames]: [any, any]) => {
            let tableName = entityName.toLowerCase();

            if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
              tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase();
            }

            const fields = await dataStore.tryExecuteSqlWithoutCls(
              `SELECT * FROM ${dataStore.getSchema().toLowerCase()}.${tableName} LIMIT 1`,
              undefined,
              false
            );

            await forEachAsyncSequential(foreignIdFieldNames, async (foreignIdFieldName: any) => {
              if (!fields.find((field) => field.name.toLowerCase() === foreignIdFieldName.toLowerCase())) {
                const alterTableStatementPrefix = `ALTER TABLE ${dataStore
                  .getSchema()
                  .toLowerCase()}.${tableName} ADD `;

                const addForeignIdColumnStatement =
                  alterTableStatementPrefix + foreignIdFieldName.toLowerCase() + ' BIGINT';

                await dataStore.tryExecuteSqlWithoutCls(addForeignIdColumnStatement);

                const addUniqueIndexStatement =
                  `CREATE UNIQUE INDEX ${
                    foreignIdFieldName.toLowerCase() +
                    (entityAnnotationContainer.entityNameToIsArrayMap[entityName] ? '_id' : '')
                  } ON ${dataStore.getSchema().toLowerCase()}.${tableName} (` +
                  foreignIdFieldName.toLowerCase() +
                  (entityAnnotationContainer.entityNameToIsArrayMap[entityName] ? ', id)' : ')');

                await dataStore.tryExecuteSqlWithoutCls(addUniqueIndexStatement);

                const addForeignKeyStatement =
                  alterTableStatementPrefix +
                  'FOREIGN KEY (' +
                  foreignIdFieldName.toLowerCase() +
                  ') REFERENCES ' +
                  dataStore.getSchema().toLowerCase() +
                  '.' +
                  foreignIdFieldName.toLowerCase().slice(0, -2) +
                  '(_id) ON DELETE CASCADE';

                await dataStore.tryExecuteSqlWithoutCls(addForeignKeyStatement);
              }
            });
          }
        );

        await forEachAsyncSequential(
          entityAnnotationContainer.manyToManyRelationTableSpecs,
          async ({
            entityName,
            associationTableName,
            entityForeignIdFieldName,
            subEntityForeignIdFieldName,
          }) => {
            if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
              return;
            }

            try {
              await dataStore.tryExecuteSqlWithoutCls(
                `SELECT * FROM ${dataStore
                  .getSchema()
                  .toLowerCase()}.${associationTableName.toLowerCase()} LIMIT 1`,
                undefined,
                false
              );
            } catch (error) {
              let subEntityName = subEntityForeignIdFieldName.slice(0, -2);
              subEntityName = subEntityName.charAt(0).toUpperCase() + subEntityName.slice(1);
              let subEntityTableName = subEntityName.toLowerCase();

              if (entityAnnotationContainer.entityNameToTableNameMap[subEntityName]) {
                subEntityTableName =
                  entityAnnotationContainer.entityNameToTableNameMap[subEntityName].toLowerCase();
              }

              const createTableStatement = `
          CREATE TABLE ${dataStore.getSchema().toLowerCase()}.${associationTableName.toLowerCase()}
           (${entityForeignIdFieldName.toLowerCase()} BIGINT,
            ${subEntityForeignIdFieldName.toLowerCase()} BIGINT,
             PRIMARY KEY(${entityForeignIdFieldName.toLowerCase()},
              ${subEntityForeignIdFieldName.toLowerCase()}),
               FOREIGN KEY(${entityForeignIdFieldName.toLowerCase()}) 
               REFERENCES ${dataStore.getSchema().toLowerCase()}.${entityForeignIdFieldName
                .toLowerCase()
                .slice(0, -2)}(_id) ON DELETE CASCADE,
            FOREIGN KEY(${subEntityForeignIdFieldName.toLowerCase()}) 
               REFERENCES ${dataStore
                 .getSchema()
                 .toLowerCase()}.${subEntityTableName}(_id) ON DELETE CASCADE)`;

              await dataStore.tryExecuteSqlWithoutCls(createTableStatement);
            }
          }
        );

        await setDbInitialized(dataStore);
        log(Severity.INFO, 'Database initialized', '');
      }
    } else if (dataStore instanceof MongoDbDataStore) {
      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.indexNameToIndexFieldsMap),
        async ([indexName, indexFields]: [any, any]) =>
          tryCreateMongoDbIndex(dataStore, indexName, dataStore.getSchema(), indexFields)
      );

      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.indexNameToUniqueIndexFieldsMap),
        async ([indexName, indexFields]: [any, any]) =>
          tryCreateMongoDbIndex(dataStore, indexName, dataStore.getSchema(), indexFields, true)
      );

      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.entityNameToClassMap),
        async ([, EntityClass]: [any, any]) => tryCreateMongoDbIndexesForUniqueFields(dataStore, EntityClass)
      );

      Object.entries(entityAnnotationContainer.entityNameToClassMap).forEach(([entityName, entityClass]) =>
        setJoinSpecs(dataStore, entityName, entityClass)
      );

      isMongoDBInitialized = true;
    }

    await tryExecuteOnStartUpTasks(microservice, dataStore);
    await tryInitializeCronJobSchedulingTable(dataStore);
  } catch (error) {
    logError(error);
    await removeDbInitialization(dataStore);
    return false;
  }

  return true;
}
