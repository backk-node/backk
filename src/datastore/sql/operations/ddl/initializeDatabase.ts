import AbstractDataStore from '../../../AbstractDataStore';
import forEachAsyncSequential from '../../../../utils/forEachAsyncSequential';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';
import tryAlterOrCreateTable from './tryAlterOrCreateTable';
import tryCreateIndex from './tryCreateIndex';
import tryCreateUniqueIndex from './tryCreateUniqueIndex';
import log, { logError, Severity } from '../../../../observability/logging/log';
import tryInitializeCronJobSchedulingTable from '../../../../scheduling/tryInitializeCronJobSchedulingTable';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import MongoDbDataStore from '../../../MongoDbDataStore';
import tryCreateMongoDbIndex from '../../../mongodb/tryCreateMongoDbIndex';
import setJoinSpecs from '../../../mongodb/setJoinSpecs';
import tryExecuteOnStartUpTasks from '../../../../initialization/tryExecuteOnStartupTasks';
import tryCreateMongoDbIndexesForUniqueFields from '../../../mongodb/tryCreateMongoDbIndexesForUniqueFields';
import shouldInitializeDb from './shouldInitializeDb';
import removeDbInitialization from './removeDbInitialization';
import setDbInitialized from './setDbInitialized';
import removeDbInitializationWhenPendingTooLong from './removeDbInitializationWhenPendingTooLong';
import getClsNamespace from '../../../../continuationlocalstorage/getClsNamespace';

let isMongoDBInitialized = false;

export async function isDbInitialized(dataStore: AbstractDataStore) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (dataStore instanceof MongoDbDataStore) {
    return isMongoDBInitialized;
  }

  if (dataStore instanceof AbstractSqlDataStore) {
    await removeDbInitializationWhenPendingTooLong(dataStore);

    const getAppVersionInitializationStatusSql = `SELECT * ${dataStore.schema.toLowerCase()}.__backk_db_initialization WHERE isinitialized = 1 AND appversion = ${
      process.env.npm_package_version
    }`;

    try {
      const clsNamespace = getClsNamespace('serviceFunctionExecution');
      return await clsNamespace.runAndReturn(async () => {
        await dataStore.tryReserveDbConnectionFromPool();
        const result = await dataStore.tryExecuteQuery(getAppVersionInitializationStatusSql);
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
  controller: any | undefined,
  dataStore: AbstractDataStore
): Promise<boolean> {
  if (!(await dataStore.isDbReady())) {
    return false;
  }

  if (!controller) {
    return false;
  }

  try {
    if (dataStore instanceof AbstractSqlDataStore) {
      if (await shouldInitializeDb(dataStore)) {
        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.entityNameToClassMap),
          async ([entityName, entityClass]: [any, any]) =>
            tryAlterOrCreateTable(dataStore, entityName, entityClass, dataStore.schema)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.indexNameToIndexFieldsMap),
          async ([indexName, indexFields]: [any, any]) =>
            tryCreateIndex(dataStore, indexName, dataStore.schema, indexFields)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.indexNameToUniqueIndexFieldsMap),
          async ([indexName, indexFields]: [any, any]) =>
            tryCreateUniqueIndex(dataStore, indexName, dataStore.schema, indexFields)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.entityNameToForeignIdFieldNamesMap),
          async ([entityName, foreignIdFieldNames]: [any, any]) => {
            let tableName = entityName.toLowerCase();

            if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
              tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase();
            }

            const fields = await dataStore.tryExecuteSqlWithoutCls(
              `SELECT * FROM ${dataStore.schema.toLowerCase()}.${tableName} LIMIT 1`,
              undefined,
              false
            );

            await forEachAsyncSequential(foreignIdFieldNames, async (foreignIdFieldName: any) => {
              if (!fields.find((field) => field.name.toLowerCase() === foreignIdFieldName.toLowerCase())) {
                const alterTableStatementPrefix = `ALTER TABLE ${dataStore.schema.toLowerCase()}.${tableName} ADD `;

                const addForeignIdColumnStatement =
                  alterTableStatementPrefix + foreignIdFieldName.toLowerCase() + ' BIGINT';

                await dataStore.tryExecuteSqlWithoutCls(addForeignIdColumnStatement);

                const addUniqueIndexStatement =
                  `CREATE UNIQUE INDEX ${foreignIdFieldName.toLowerCase() +
                    (entityAnnotationContainer.entityNameToIsArrayMap[entityName]
                      ? '_id'
                      : '')} ON ${dataStore.schema.toLowerCase()}.${tableName} (` +
                  foreignIdFieldName.toLowerCase() +
                  (entityAnnotationContainer.entityNameToIsArrayMap[entityName] ? ', id)' : ')');

                await dataStore.tryExecuteSqlWithoutCls(addUniqueIndexStatement);

                const addForeignKeyStatement =
                  alterTableStatementPrefix +
                  'FOREIGN KEY (' +
                  foreignIdFieldName.toLowerCase() +
                  ') REFERENCES ' +
                  dataStore.schema.toLowerCase() +
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
            subEntityForeignIdFieldName
          }) => {
            if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
              return;
            }

            try {
              await dataStore.tryExecuteSqlWithoutCls(
                `SELECT * FROM ${dataStore.schema.toLowerCase()}.${associationTableName.toLowerCase()} LIMIT 1`,
                undefined,
                false
              );
            } catch (error) {
              let subEntityName = subEntityForeignIdFieldName.slice(0, -2);
              subEntityName = subEntityName.charAt(0).toUpperCase() + subEntityName.slice(1);
              let subEntityTableName = subEntityName.toLowerCase();

              if (entityAnnotationContainer.entityNameToTableNameMap[subEntityName]) {
                subEntityTableName = entityAnnotationContainer.entityNameToTableNameMap[
                  subEntityName
                ].toLowerCase();
              }

              const createTableStatement = `
          CREATE TABLE ${dataStore.schema.toLowerCase()}.${associationTableName.toLowerCase()}
           (${entityForeignIdFieldName.toLowerCase()} BIGINT,
            ${subEntityForeignIdFieldName.toLowerCase()} BIGINT,
             PRIMARY KEY(${entityForeignIdFieldName.toLowerCase()},
              ${subEntityForeignIdFieldName.toLowerCase()}),
               FOREIGN KEY(${entityForeignIdFieldName.toLowerCase()}) 
               REFERENCES ${dataStore.schema.toLowerCase()}.${entityForeignIdFieldName
                .toLowerCase()
                .slice(0, -2)}(_id) ON DELETE CASCADE,
            FOREIGN KEY(${subEntityForeignIdFieldName.toLowerCase()}) 
               REFERENCES ${dataStore.schema.toLowerCase()}.${subEntityTableName}(_id) ON DELETE CASCADE)`;

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
          tryCreateMongoDbIndex(dataStore, indexName, dataStore.schema, indexFields)
      );

      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.indexNameToUniqueIndexFieldsMap),
        async ([indexName, indexFields]: [any, any]) =>
          tryCreateMongoDbIndex(dataStore, indexName, dataStore.schema, indexFields, true)
      );

      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.entityNameToClassMap),
        async ([, EntityClass]: [any, any]) => tryCreateMongoDbIndexesForUniqueFields(dataStore, EntityClass)
      );

      Object.entries(entityAnnotationContainer.entityNameToClassMap).forEach(([entityName, entityClass]) =>
        setJoinSpecs(dataStore, entityName, entityClass)
      );

      isMongoDBInitialized = true;
      log(Severity.INFO, 'Database initialized', '');
    }

    await tryExecuteOnStartUpTasks(controller, dataStore);
    await tryInitializeCronJobSchedulingTable(dataStore);
  } catch (error) {
    logError(error);
    await removeDbInitialization(dataStore);
    return false;
  }

  return true;
}
