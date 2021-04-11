"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDbInitialized = void 0;
const forEachAsyncSequential_1 = __importDefault(require("../../../../utils/forEachAsyncSequential"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const tryAlterOrCreateTable_1 = __importDefault(require("./tryAlterOrCreateTable"));
const tryCreateIndex_1 = __importDefault(require("./tryCreateIndex"));
const tryCreateUniqueIndex_1 = __importDefault(require("./tryCreateUniqueIndex"));
const log_1 = __importStar(require("../../../../observability/logging/log"));
const tryInitializeCronJobSchedulingTable_1 = __importDefault(require("../../../../scheduling/tryInitializeCronJobSchedulingTable"));
const AbstractSqlDbManager_1 = __importDefault(require("../../../AbstractSqlDbManager"));
const MongoDbManager_1 = __importDefault(require("../../../MongoDbManager"));
const tryCreateMongoDbIndex_1 = __importDefault(require("../../../mongodb/tryCreateMongoDbIndex"));
const setJoinSpecs_1 = __importDefault(require("../../../mongodb/setJoinSpecs"));
const tryExecuteOnStartupTasks_1 = __importDefault(require("../../../../initialization/tryExecuteOnStartupTasks"));
const tryCreateMongoDbIndexesForUniqueFields_1 = __importDefault(require("../../../mongodb/tryCreateMongoDbIndexesForUniqueFields"));
const shouldInitializeDb_1 = __importDefault(require("./shouldInitializeDb"));
const removeDbInitialization_1 = __importDefault(require("./removeDbInitialization"));
const setDbInitialized_1 = __importDefault(require("./setDbInitialized"));
const removeDbInitializationWhenPendingTooLong_1 = __importDefault(require("./removeDbInitializationWhenPendingTooLong"));
const getClsNamespace_1 = __importDefault(require("../../../../continuationlocalstorages/getClsNamespace"));
let isMongoDBInitialized = false;
async function isDbInitialized(dbManager) {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    if (dbManager instanceof MongoDbManager_1.default) {
        return isMongoDBInitialized;
    }
    if (dbManager instanceof AbstractSqlDbManager_1.default) {
        await removeDbInitializationWhenPendingTooLong_1.default(dbManager);
        const getAppVersionInitializationStatusSql = `SELECT * ${dbManager.schema.toLowerCase()}.__backk_db_initialization WHERE isinitialized = 1 AND appversion = ${process.env.npm_package_version}`;
        try {
            const clsNamespace = getClsNamespace_1.default('serviceFunctionExecution');
            return await clsNamespace.runAndReturn(async () => {
                await dbManager.tryReserveDbConnectionFromPool();
                const result = await dbManager.tryExecuteQuery(getAppVersionInitializationStatusSql);
                const rows = dbManager.getResultRows(result);
                return rows.length === 1;
            });
        }
        catch (error) {
            return false;
        }
        finally {
            dbManager.tryReleaseDbConnectionBackToPool();
        }
    }
    return false;
}
exports.isDbInitialized = isDbInitialized;
async function initializeDatabase(controller, dbManager) {
    if (!(await dbManager.isDbReady())) {
        return false;
    }
    if (!controller) {
        return false;
    }
    try {
        if (dbManager instanceof AbstractSqlDbManager_1.default) {
            if (await shouldInitializeDb_1.default(dbManager)) {
                await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.entityNameToClassMap), async ([entityName, entityClass]) => tryAlterOrCreateTable_1.default(dbManager, entityName, entityClass, dbManager.schema));
                await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.indexNameToIndexFieldsMap), async ([indexName, indexFields]) => tryCreateIndex_1.default(dbManager, indexName, dbManager.schema, indexFields));
                await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.indexNameToUniqueIndexFieldsMap), async ([indexName, indexFields]) => tryCreateUniqueIndex_1.default(dbManager, indexName, dbManager.schema, indexFields));
                await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.entityNameToForeignIdFieldNamesMap), async ([entityName, foreignIdFieldNames]) => {
                    let tableName = entityName.toLowerCase();
                    if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
                        tableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName].toLowerCase();
                    }
                    const fields = await dbManager.tryExecuteSqlWithoutCls(`SELECT * FROM ${dbManager.schema.toLowerCase()}.${tableName} LIMIT 1`, undefined, false);
                    await forEachAsyncSequential_1.default(foreignIdFieldNames, async (foreignIdFieldName) => {
                        if (!fields.find((field) => field.name.toLowerCase() === foreignIdFieldName.toLowerCase())) {
                            const alterTableStatementPrefix = `ALTER TABLE ${dbManager.schema.toLowerCase()}.${tableName} ADD `;
                            const addForeignIdColumnStatement = alterTableStatementPrefix + foreignIdFieldName.toLowerCase() + ' BIGINT';
                            await dbManager.tryExecuteSqlWithoutCls(addForeignIdColumnStatement);
                            const addUniqueIndexStatement = `CREATE UNIQUE INDEX ${foreignIdFieldName.toLowerCase() +
                                (entityAnnotationContainer_1.default.entityNameToIsArrayMap[entityName]
                                    ? '_id'
                                    : '')} ON ${dbManager.schema.toLowerCase()}.${tableName} (` +
                                foreignIdFieldName.toLowerCase() +
                                (entityAnnotationContainer_1.default.entityNameToIsArrayMap[entityName] ? ', id)' : ')');
                            await dbManager.tryExecuteSqlWithoutCls(addUniqueIndexStatement);
                            const addForeignKeyStatement = alterTableStatementPrefix +
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
                });
                await forEachAsyncSequential_1.default(entityAnnotationContainer_1.default.manyToManyRelationTableSpecs, async ({ entityName, associationTableName, entityForeignIdFieldName, subEntityForeignIdFieldName }) => {
                    if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
                        return;
                    }
                    try {
                        await dbManager.tryExecuteSqlWithoutCls(`SELECT * FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} LIMIT 1`, undefined, false);
                    }
                    catch (error) {
                        let subEntityName = subEntityForeignIdFieldName.slice(0, -2);
                        subEntityName = subEntityName.charAt(0).toUpperCase() + subEntityName.slice(1);
                        let subEntityTableName = subEntityName.toLowerCase();
                        if (entityAnnotationContainer_1.default.entityNameToTableNameMap[subEntityName]) {
                            subEntityTableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[subEntityName].toLowerCase();
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
                });
                await setDbInitialized_1.default(dbManager);
                log_1.default(log_1.Severity.INFO, 'Database initialized', '');
            }
        }
        else if (dbManager instanceof MongoDbManager_1.default) {
            await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.indexNameToIndexFieldsMap), async ([indexName, indexFields]) => tryCreateMongoDbIndex_1.default(dbManager, indexName, dbManager.schema, indexFields));
            await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.indexNameToUniqueIndexFieldsMap), async ([indexName, indexFields]) => tryCreateMongoDbIndex_1.default(dbManager, indexName, dbManager.schema, indexFields, true));
            await forEachAsyncSequential_1.default(Object.entries(entityAnnotationContainer_1.default.entityNameToClassMap), async ([, EntityClass]) => tryCreateMongoDbIndexesForUniqueFields_1.default(dbManager, EntityClass));
            Object.entries(entityAnnotationContainer_1.default.entityNameToClassMap).forEach(([entityName, entityClass]) => setJoinSpecs_1.default(dbManager, entityName, entityClass));
            isMongoDBInitialized = true;
            log_1.default(log_1.Severity.INFO, 'Database initialized', '');
        }
        await tryExecuteOnStartupTasks_1.default(controller, dbManager);
        await tryInitializeCronJobSchedulingTable_1.default(dbManager);
    }
    catch (error) {
        log_1.logError(error);
        await removeDbInitialization_1.default(dbManager);
        return false;
    }
    return true;
}
exports.default = initializeDatabase;
//# sourceMappingURL=initializeDatabase.js.map