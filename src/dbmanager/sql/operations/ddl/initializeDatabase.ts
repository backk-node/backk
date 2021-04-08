import AbstractDbManager from '../../../AbstractDbManager';
import forEachAsyncSequential from '../../../../utils/forEachAsyncSequential';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';
import tryAlterOrCreateTable from './tryAlterOrCreateTable';
import tryCreateIndex from './tryCreateIndex';
import tryCreateUniqueIndex from './tryCreateUniqueIndex';
import log, { logError, Severity } from '../../../../observability/logging/log';
import tryInitializeCronJobSchedulingTable from '../../../../scheduling/tryInitializeCronJobSchedulingTable';
import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import MongoDbManager from '../../../MongoDbManager';
import tryCreateMongoDbIndex from '../../../mongodb/tryCreateMongoDbIndex';
import setJoinSpecs from '../../../mongodb/setJoinSpecs';
import tryExecuteOnStartUpTasks from '../../../../initialization/tryExecuteOnStartupTasks';
import tryCreateMongoDbIndexesForUniqueFields from '../../../mongodb/tryCreateMongoDbIndexesForUniqueFields';
import shouldInitializeDb from './shouldInitializeDb';
import removeDbInitialization from './removeDbInitialization';
import setDbInitialized from './setDbInitialized';
import removeDbInitializationWhenPendingTooLong from './removeDbInitializationWhenPendingTooLong';
import getClsNamespace from '../../../../continuationlocalstorages/getClsNamespace';

let isMongoDBInitialized = false;

export async function isDbInitialized(dbManager: AbstractDbManager) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (dbManager instanceof MongoDbManager) {
    return isMongoDBInitialized;
  }

  if (dbManager instanceof AbstractSqlDbManager) {
    await removeDbInitializationWhenPendingTooLong(dbManager);

    const getAppVersionInitializationStatusSql = `SELECT * ${dbManager.schema.toLowerCase()}.__backk_db_initialization WHERE isinitialized = 1 AND appversion = ${
      process.env.npm_package_version
    }`;

    try {
      const clsNamespace = getClsNamespace('serviceFunctionExecution');
      return await clsNamespace.runAndReturn(async () => {
        await dbManager.tryReserveDbConnectionFromPool();
        const result = await dbManager.tryExecuteQuery(getAppVersionInitializationStatusSql);
        const rows = dbManager.getResultRows(result);
        return rows.length === 1;
      });
    } catch (error) {
      return false;
    } finally {
      dbManager.tryReleaseDbConnectionBackToPool();
    }
  }

  return false;
}

export default async function initializeDatabase(
  controller: any | undefined,
  dbManager: AbstractDbManager
): Promise<boolean> {
  if (!(await dbManager.isDbReady())) {
    return false;
  }

  if (!controller) {
    return false;
  }

  try {
    if (dbManager instanceof AbstractSqlDbManager) {
      if (await shouldInitializeDb(dbManager)) {
        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.entityNameToClassMap),
          async ([entityName, entityClass]: [any, any]) =>
            tryAlterOrCreateTable(dbManager, entityName, entityClass, dbManager.schema)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.indexNameToIndexFieldsMap),
          async ([indexName, indexFields]: [any, any]) =>
            tryCreateIndex(dbManager, indexName, dbManager.schema, indexFields)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.indexNameToUniqueIndexFieldsMap),
          async ([indexName, indexFields]: [any, any]) =>
            tryCreateUniqueIndex(dbManager, indexName, dbManager.schema, indexFields)
        );

        await forEachAsyncSequential(
          Object.entries(entityAnnotationContainer.entityNameToForeignIdFieldNamesMap),
          async ([entityName, foreignIdFieldNames]: [any, any]) => {
            let tableName = entityName.toLowerCase();

            if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
              tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase();
            }

            const fields = await dbManager.tryExecuteSqlWithoutCls(
              `SELECT * FROM ${dbManager.schema.toLowerCase()}.${tableName} LIMIT 1`,
              undefined,
              false
            );

            await forEachAsyncSequential(foreignIdFieldNames, async (foreignIdFieldName: any) => {
              if (!fields.find((field) => field.name.toLowerCase() === foreignIdFieldName.toLowerCase())) {
                const alterTableStatementPrefix = `ALTER TABLE ${dbManager.schema.toLowerCase()}.${tableName} ADD `;

                const addForeignIdColumnStatement =
                  alterTableStatementPrefix + foreignIdFieldName.toLowerCase() + ' BIGINT';

                await dbManager.tryExecuteSqlWithoutCls(addForeignIdColumnStatement);

                const addUniqueIndexStatement =
                  `CREATE UNIQUE INDEX ${foreignIdFieldName.toLowerCase() +
                    (entityAnnotationContainer.entityNameToIsArrayMap[entityName]
                      ? '_id'
                      : '')} ON ${dbManager.schema.toLowerCase()}.${tableName} (` +
                  foreignIdFieldName.toLowerCase() +
                  (entityAnnotationContainer.entityNameToIsArrayMap[entityName] ? ', id)' : ')');

                await dbManager.tryExecuteSqlWithoutCls(addUniqueIndexStatement);

                const addForeignKeyStatement =
                  alterTableStatementPrefix +
                  'FOREIGN KEY (' +
                  foreignIdFieldName.toLowerCase() +
                  ') REFERENCES ' +
                  dbManager.schema.toLowerCase() +
                  '.' +
                  foreignIdFieldName.toLowerCase().slice(0, -2) +
                  '(_id) ON DELETE CASCADE';

                await dbManager.tryExecuteSqlWithoutCls(addForeignKeyStatement);
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
              await dbManager.tryExecuteSqlWithoutCls(
                `SELECT * FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} LIMIT 1`,
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
          CREATE TABLE ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()}
           (${entityForeignIdFieldName.toLowerCase()} BIGINT,
            ${subEntityForeignIdFieldName.toLowerCase()} BIGINT,
             PRIMARY KEY(${entityForeignIdFieldName.toLowerCase()},
              ${subEntityForeignIdFieldName.toLowerCase()}),
               FOREIGN KEY(${entityForeignIdFieldName.toLowerCase()}) 
               REFERENCES ${dbManager.schema.toLowerCase()}.${entityForeignIdFieldName
                .toLowerCase()
                .slice(0, -2)}(_id) ON DELETE CASCADE,
            FOREIGN KEY(${subEntityForeignIdFieldName.toLowerCase()}) 
               REFERENCES ${dbManager.schema.toLowerCase()}.${subEntityTableName}(_id) ON DELETE CASCADE)`;

              await dbManager.tryExecuteSqlWithoutCls(createTableStatement);
            }
          }
        );

        await setDbInitialized(dbManager);
        log(Severity.INFO, 'Database initialized', '');
      }
    } else if (dbManager instanceof MongoDbManager) {
      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.indexNameToIndexFieldsMap),
        async ([indexName, indexFields]: [any, any]) =>
          tryCreateMongoDbIndex(dbManager, indexName, dbManager.schema, indexFields)
      );

      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.indexNameToUniqueIndexFieldsMap),
        async ([indexName, indexFields]: [any, any]) =>
          tryCreateMongoDbIndex(dbManager, indexName, dbManager.schema, indexFields, true)
      );

      await forEachAsyncSequential(
        Object.entries(entityAnnotationContainer.entityNameToClassMap),
        async ([, EntityClass]: [any, any]) => tryCreateMongoDbIndexesForUniqueFields(dbManager, EntityClass)
      );

      Object.entries(entityAnnotationContainer.entityNameToClassMap).forEach(([entityName, entityClass]) =>
        setJoinSpecs(dbManager, entityName, entityClass)
      );

      isMongoDBInitialized = true;
      log(Severity.INFO, 'Database initialized', '');
    }

    await tryExecuteOnStartUpTasks(controller, dbManager);
    await tryInitializeCronJobSchedulingTable(dbManager);
  } catch (error) {
    logError(error);
    await removeDbInitialization(dbManager);
    return false;
  }

  return true;
}
