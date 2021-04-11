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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const common_1 = require("@nestjs/common");
const SqlExpression_1 = __importDefault(require("./sql/expressions/SqlExpression"));
const AbstractDbManager_1 = __importDefault(require("./AbstractDbManager"));
const createEntity_1 = __importDefault(require("./sql/operations/dml/createEntity"));
const getEntitiesByFilters_1 = __importDefault(require("./sql/operations/dql/getEntitiesByFilters"));
const getEntitiesCount_1 = __importDefault(require("./sql/operations/dql/getEntitiesCount"));
const getEntityById_1 = __importDefault(require("./sql/operations/dql/getEntityById"));
const getEntityWhere_1 = __importDefault(require("./sql/operations/dql/getEntityWhere"));
const getEntitiesWhere_1 = __importDefault(require("./sql/operations/dql/getEntitiesWhere"));
const updateEntity_1 = __importDefault(require("./sql/operations/dml/updateEntity"));
const deleteEntityById_1 = __importDefault(require("./sql/operations/dml/deleteEntityById"));
const removeSubEntities_1 = __importDefault(require("./sql/operations/dml/removeSubEntities"));
const deleteAllEntities_1 = __importDefault(require("./sql/operations/dml/deleteAllEntities"));
const getEntitiesByIds_1 = __importDefault(require("./sql/operations/dql/getEntitiesByIds"));
const defaultServiceMetrics_1 = __importDefault(require("../observability/metrics/defaultServiceMetrics"));
const createBackkErrorFromError_1 = __importDefault(require("../errors/createBackkErrorFromError"));
const log_1 = __importStar(require("../observability/logging/log"));
const addSubEntities_1 = __importDefault(require("./sql/operations/dml/addSubEntities"));
const startDbOperation_1 = __importDefault(require("./utils/startDbOperation"));
const recordDbOperationDuration_1 = __importDefault(require("./utils/recordDbOperationDuration"));
const deleteEntitiesWhere_1 = __importDefault(require("./sql/operations/dml/deleteEntitiesWhere"));
const cls_hooked_1 = require("cls-hooked");
const updateEntityWhere_1 = __importDefault(require("./sql/operations/dml/updateEntityWhere"));
const getAllEntities_1 = __importDefault(require("./sql/operations/dql/getAllEntities"));
const deleteEntitiesByFilters_1 = __importDefault(require("./sql/operations/dml/deleteEntitiesByFilters"));
const updateEntitiesByFilters_1 = __importDefault(require("./sql/operations/dml/updateEntitiesByFilters"));
const deleteEntityWhere_1 = __importDefault(require("./sql/operations/dml/deleteEntityWhere"));
const addFieldValues_1 = __importDefault(require("./sql/operations/dml/addFieldValues"));
const removeFieldValues_1 = __importDefault(require("./sql/operations/dml/removeFieldValues"));
const addSubEntitiesByFilters_1 = __importDefault(require("./sql/operations/dml/addSubEntitiesByFilters"));
const getEntityByFilters_1 = __importDefault(require("./sql/operations/dql/getEntityByFilters"));
const deleteEntityByFilters_1 = __importDefault(require("./sql/operations/dml/deleteEntityByFilters"));
const updateEntityByFilters_1 = __importDefault(require("./sql/operations/dml/updateEntityByFilters"));
const removeSubEntitiesWhere_1 = __importDefault(require("./sql/operations/dml/removeSubEntitiesWhere"));
const doesEntityArrayFieldContainValue_1 = __importDefault(require("./sql/operations/dql/doesEntityArrayFieldContainValue"));
let AbstractSqlDbManager = class AbstractSqlDbManager extends AbstractDbManager_1.default {
    getClient() {
        return undefined;
    }
    cleanupTransaction() {
    }
    getFilters(mongoDbFilters, sqlFilters) {
        return sqlFilters instanceof SqlExpression_1.default ? [sqlFilters] : sqlFilters;
    }
    async isDbReady() {
        try {
            await this.tryExecuteSqlWithoutCls(`SELECT * FROM ${this.schema.toLowerCase()}.__backk_db_initialization`, undefined, false);
            return true;
        }
        catch (error) {
            try {
                const createTableStatement = `CREATE TABLE IF NOT EXISTS ${this.schema.toLowerCase()}.__backk_db_initialization (appversion VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE, isinitialized ${this.getBooleanType()}, createdattimestamp ${this.getTimestampType()})`;
                await this.tryExecuteSqlWithoutCls(createTableStatement);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    }
    async tryReserveDbConnectionFromPool() {
        var _a, _b, _c, _d, _e;
        if ((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('connection')) {
            return;
        }
        log_1.default(log_1.Severity.DEBUG, 'Acquire database connection', '');
        try {
            const connection = await this.getConnection();
            (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('connection', connection);
            (_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.set('localTransaction', false);
            (_d = this.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.set('globalTransaction', false);
            if (this.firstDbOperationFailureTimeInMillis) {
                this.firstDbOperationFailureTimeInMillis = 0;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
            }
        }
        catch (error) {
            if (this.firstDbOperationFailureTimeInMillis) {
                const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), failureDurationInSecs);
            }
            log_1.default(log_1.Severity.ERROR, error.message, (_e = error.stack) !== null && _e !== void 0 ? _e : '', {
                function: `${this.constructor.name}.tryReserveDbConnectionFromPool`
            });
            throw error;
        }
    }
    tryReleaseDbConnectionBackToPool() {
        var _a, _b, _c, _d;
        if ((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('connection')) {
            return;
        }
        log_1.default(log_1.Severity.DEBUG, 'Release database connection', '');
        try {
            this.releaseConnection((_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('connection'));
        }
        catch (error) {
            log_1.default(log_1.Severity.ERROR, error.message, (_c = error.stack) !== null && _c !== void 0 ? _c : '', {
                function: `${this.constructor.name}.tryReleaseDbConnectionBackToPool`
            });
            throw error;
        }
        (_d = this.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.set('connection', null);
    }
    async tryBeginTransaction() {
        var _a, _b;
        log_1.default(log_1.Severity.DEBUG, 'Begin database transaction', '');
        try {
            await ((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('connection').query(this.getBeginTransactionStatement()));
            if (this.firstDbOperationFailureTimeInMillis) {
                this.firstDbOperationFailureTimeInMillis = 0;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
            }
        }
        catch (error) {
            if (this.firstDbOperationFailureTimeInMillis) {
                const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), failureDurationInSecs);
            }
            log_1.default(log_1.Severity.ERROR, error.message, (_b = error.stack) !== null && _b !== void 0 ? _b : '', {
                function: `${this.constructor.name}.tryBeginTransaction`,
                sqlStatement: 'BEGIN'
            });
            throw error;
        }
    }
    async tryCommitTransaction() {
        var _a, _b;
        log_1.default(log_1.Severity.DEBUG, 'Commit database transaction', '');
        try {
            await ((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('connection').query('COMMIT'));
        }
        catch (error) {
            log_1.default(log_1.Severity.ERROR, error.message, (_b = error.stack) !== null && _b !== void 0 ? _b : '', {
                function: `${this.constructor.name}.tryCommitTransaction`,
                sqlStatement: 'COMMIT'
            });
            throw error;
        }
    }
    async tryRollbackTransaction() {
        var _a, _b;
        log_1.default(log_1.Severity.DEBUG, 'Rollback database transaction', '');
        try {
            await ((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('connection').query('ROLLBACK'));
        }
        catch (error) {
            log_1.default(log_1.Severity.ERROR, error.message, (_b = error.stack) !== null && _b !== void 0 ? _b : '', {
                function: `${this.constructor.name}.tryRollbackTransaction`,
                sqlStatement: 'ROLLBACK'
            });
        }
    }
    async tryExecuteSql(sqlStatement, values, shouldReportError = true) {
        var _a, _b, _c, _d;
        if (((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('remoteServiceCallCount')) > 0) {
            (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('dbManagerOperationAfterRemoteServiceCall', true);
        }
        log_1.default(log_1.Severity.DEBUG, 'Database DML operation', sqlStatement);
        try {
            const result = await this.executeSql((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('connection'), sqlStatement, values);
            return this.getResultFields(result);
        }
        catch (error) {
            if (shouldReportError && !this.isDuplicateEntityError(error)) {
                defaultServiceMetrics_1.default.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());
                log_1.default(log_1.Severity.ERROR, error.message, (_d = error.stack) !== null && _d !== void 0 ? _d : '', {
                    sqlStatement,
                    function: `${this.constructor.name}.tryExecuteSql`
                });
            }
            throw error;
        }
    }
    async tryExecuteSqlWithoutCls(sqlStatement, values, shouldReportError = true, shouldReportSuccess = true) {
        var _a;
        log_1.default(log_1.Severity.DEBUG, 'Database DDL operation', sqlStatement);
        try {
            const result = await this.getPool().query(sqlStatement, values);
            if (shouldReportSuccess && (sqlStatement.startsWith('CREATE') || sqlStatement.startsWith('ALTER'))) {
                log_1.default(log_1.Severity.INFO, 'Database initialization operation', '', {
                    sqlStatement,
                    function: `${this.constructor.name}.tryExecuteSqlWithoutCls`
                });
            }
            return this.getResultFields(result);
        }
        catch (error) {
            if (shouldReportError && !this.isDuplicateEntityError(error)) {
                defaultServiceMetrics_1.default.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());
                log_1.default(log_1.Severity.ERROR, error.message, (_a = error.stack) !== null && _a !== void 0 ? _a : '', {
                    sqlStatement,
                    function: `${this.constructor.name}.tryExecuteSqlWithoutCls`
                });
            }
            throw error;
        }
    }
    async tryExecuteQuery(sqlStatement, values) {
        var _a, _b, _c, _d;
        if (((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('remoteServiceCallCount')) > 0) {
            (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('dbManagerOperationAfterRemoteServiceCall', true);
        }
        log_1.default(log_1.Severity.DEBUG, 'Database DQL operation', sqlStatement);
        try {
            const response = await this.executeSql((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('connection'), sqlStatement, values);
            if (this.firstDbOperationFailureTimeInMillis) {
                this.firstDbOperationFailureTimeInMillis = 0;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
            }
            return response;
        }
        catch (error) {
            if (!this.isDuplicateEntityError(error)) {
                if (this.firstDbOperationFailureTimeInMillis) {
                    const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
                    defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), failureDurationInSecs);
                }
                defaultServiceMetrics_1.default.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());
                log_1.default(log_1.Severity.ERROR, error.message, (_d = error.stack) !== null && _d !== void 0 ? _d : '', {
                    sqlStatement,
                    function: `${this.constructor.name}.tryExecuteQuery`
                });
            }
            throw error;
        }
    }
    async tryExecuteQueryWithNamedParameters(sqlStatement, values) {
        var _a, _b, _c, _d;
        if (((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('remoteServiceCallCount')) > 0) {
            (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('dbManagerOperationAfterRemoteServiceCall', true);
        }
        log_1.default(log_1.Severity.DEBUG, 'Database DQL operation', sqlStatement);
        try {
            const response = await this.executeSqlWithNamedPlaceholders((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('connection'), sqlStatement, values);
            if (this.firstDbOperationFailureTimeInMillis) {
                this.firstDbOperationFailureTimeInMillis = 0;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
            }
            return response;
        }
        catch (error) {
            if (this.firstDbOperationFailureTimeInMillis) {
                const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), failureDurationInSecs);
            }
            defaultServiceMetrics_1.default.incrementDbOperationErrorsByOne(this.getDbManagerType(), this.getDbHost());
            log_1.default(log_1.Severity.ERROR, error.message, (_d = error.stack) !== null && _d !== void 0 ? _d : '', {
                sqlStatement,
                function: `${this.constructor.name}.tryExecuteQueryWithNamedParameters`
            });
            throw error;
        }
    }
    async executeInsideTransaction(executable) {
        var _a, _b, _c;
        if ((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) {
            return executable();
        }
        (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('globalTransaction', true);
        try {
            await this.tryBeginTransaction();
            if (this.firstDbOperationFailureTimeInMillis) {
                this.firstDbOperationFailureTimeInMillis = 0;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), 0);
            }
        }
        catch (error) {
            if (this.firstDbOperationFailureTimeInMillis) {
                const failureDurationInSecs = (Date.now() - this.firstDbOperationFailureTimeInMillis) / 1000;
                defaultServiceMetrics_1.default.recordDbFailureDurationInSecs(this.getDbManagerType(), this.getDbHost(), failureDurationInSecs);
            }
            return [null, createBackkErrorFromError_1.default(error)];
        }
        const [result, error] = await executable();
        if (error) {
            try {
                await this.tryRollbackTransaction();
            }
            catch (error) {
                return [null, createBackkErrorFromError_1.default(error)];
            }
        }
        else {
            try {
                await this.tryCommitTransaction();
            }
            catch (error) {
                return [null, createBackkErrorFromError_1.default(error)];
            }
        }
        (_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.set('globalTransaction', false);
        return [result, error];
    }
    async createEntity(entityClass, entity, options, shouldReturnItem = true) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'createEntity');
        const response = await createEntity_1.default(this, entity, entityClass, options === null || options === void 0 ? void 0 : options.preHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations, false, shouldReturnItem);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addSubEntityToEntityById(subEntityPath, subEntity, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntityToEntityById');
        const response = await addSubEntities_1.default(this, _id, subEntityPath, [subEntity], EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addSubEntityToEntityByFilters(subEntityPath, subEntity, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntityToEntityByFilters');
        const response = await addSubEntitiesByFilters_1.default(this, filters, subEntityPath, [subEntity], EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addSubEntitiesToEntityByFilters(subEntityPath, subEntities, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntitiesToEntityByFilters');
        const response = await addSubEntitiesByFilters_1.default(this, filters, subEntityPath, subEntities, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addSubEntitiesToEntityById(subEntityPath, subEntities, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntitiesToEntityById');
        const response = await addSubEntities_1.default(this, _id, subEntityPath, subEntities, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getAllEntities(entityClass, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntitiesByFilters');
        const response = await getAllEntities_1.default(this, entityClass, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntitiesByFilters(EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntitiesByFilters');
        const response = await getEntitiesByFilters_1.default(this, filters, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntityByFilters(EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityByFilters');
        const response = await getEntityByFilters_1.default(this, filters, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntityCount(entityClass, filters) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityCount');
        const response = await getEntitiesCount_1.default(this, filters, entityClass);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntityById(EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityById');
        const response = await getEntityById_1.default(this, _id, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntitiesByIds(EntityClass, _ids, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntitiesByIds');
        const response = await getEntitiesByIds_1.default(this, _ids, EntityClass, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntityByField(entityClass, fieldPathName, fieldValue, options, isSelectForUpdate = false) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityByField');
        const response = await getEntityWhere_1.default(this, fieldPathName, fieldValue, entityClass, options === null || options === void 0 ? void 0 : options.preHooks, options === null || options === void 0 ? void 0 : options.postQueryOperations, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn, isSelectForUpdate);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async getEntitiesByField(EntityClass, fieldPathName, fieldValue, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntitiesByField');
        const response = await getEntitiesWhere_1.default(this, fieldPathName, fieldValue, EntityClass, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async updateEntity(EntityClass, entityUpdate, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntity');
        const response = await updateEntity_1.default(this, entityUpdate, EntityClass, options === null || options === void 0 ? void 0 : options.preHooks, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async updateEntityByFilters(EntityClass, filters, entityUpdate, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntityByFilters');
        const response = await updateEntityByFilters_1.default(this, filters, entityUpdate, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async updateEntitiesByFilters(EntityClass, filters, entityUpdate) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntitiesByFilters');
        const response = await updateEntitiesByFilters_1.default(this, filters, entityUpdate, EntityClass);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async updateEntityByField(EntityClass, fieldPathName, fieldValue, entityUpdate, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntityByField');
        const response = await updateEntityWhere_1.default(this, fieldPathName, fieldValue, entityUpdate, EntityClass, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteEntityById(EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntityById');
        const response = await deleteEntityById_1.default(this, _id, EntityClass, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteEntitiesByField(EntityClass, fieldName, fieldValue) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntitiesByField');
        const response = await deleteEntitiesWhere_1.default(this, fieldName, fieldValue, EntityClass);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteEntityByField(EntityClass, fieldName, fieldValue, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntityByField');
        const response = await deleteEntityWhere_1.default(this, fieldName, fieldValue, EntityClass, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteEntityByFilters(EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntityByFilters');
        const response = await deleteEntityByFilters_1.default(this, filters, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteEntitiesByFilters(EntityClass, filters) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntitiesByFilters');
        const response = await deleteEntitiesByFilters_1.default(this, filters, EntityClass);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async removeSubEntitiesByJsonPathFromEntityById(subEntitiesJsonPath, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntitiesByJsonPathFromEntityById');
        const response = await removeSubEntities_1.default(this, _id, subEntitiesJsonPath, EntityClass, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async removeSubEntityByIdFromEntityById(subEntitiesJsonPath, subEntityId, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntityByIdFromEntityById');
        const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
        const response = await this.removeSubEntitiesByJsonPathFromEntityById(subEntityJsonPath, EntityClass, _id, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async removeSubEntitiesByJsonPathFromEntityByFilters(subEntitiesJsonPath, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntitiesByJsonPathFromEntityByFilters');
        const response = await removeSubEntitiesWhere_1.default(this, filters, subEntitiesJsonPath, EntityClass, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async removeSubEntityByIdFromEntityByFilters(subEntitiesJsonPath, subEntityId, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntityByIdFromEntityByFilters');
        const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
        const response = await removeSubEntitiesWhere_1.default(this, filters, subEntityJsonPath, EntityClass, options === null || options === void 0 ? void 0 : options.entityPreHooks, options === null || options === void 0 ? void 0 : options.postHook, options === null || options === void 0 ? void 0 : options.postQueryOperations);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteAllEntities(entityClass) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteAllEntities');
        const response = await deleteAllEntities_1.default(this, entityClass);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addEntityArrayFieldValues(EntityClass, _id, fieldName, fieldValues, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addEntityArrayFieldValues');
        const response = await addFieldValues_1.default(this, _id, fieldName, fieldValues, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async doesEntityArrayFieldContainValue(EntityClass, _id, fieldName, fieldValue) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'doesEntityArrayFieldContainValue');
        const response = await doesEntityArrayFieldContainValue_1.default(this, EntityClass, _id, fieldName, fieldValue);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async removeEntityArrayFieldValues(EntityClass, _id, fieldName, fieldValues, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeEntityArrayFieldValues');
        const response = await removeFieldValues_1.default(this, _id, fieldName, fieldValues, EntityClass, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
};
AbstractSqlDbManager = __decorate([
    common_1.Injectable()
], AbstractSqlDbManager);
exports.default = AbstractSqlDbManager;
//# sourceMappingURL=AbstractSqlDbManager.js.map