"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractDbManager_1 = __importDefault(require("./AbstractDbManager"));
class NoOpDbManager extends AbstractDbManager_1.default {
    updateEntityByFilters() {
        throw new Error('Not implemented');
    }
    deleteEntityByFilters() {
        throw new Error('Not implemented');
    }
    getModifyColumnStatement() {
        throw new Error('Not implemented');
    }
    addSubEntitiesToEntityById() {
        throw new Error('Not implemented');
    }
    addSubEntityToEntityById() {
        throw new Error('Not implemented');
    }
    createEntity() {
        throw new Error('Not implemented');
    }
    deleteAllEntities() {
        throw new Error('Not implemented');
    }
    deleteEntitiesByFilters() {
        throw new Error('Not implemented');
    }
    deleteEntitiesByField() {
        throw new Error('Not implemented');
    }
    deleteEntityById() {
        throw new Error('Not implemented');
    }
    executeInsideTransaction() {
        throw new Error('Not implemented');
    }
    getAllEntities() {
        throw new Error('Not implemented');
    }
    getDbHost() {
        return '';
    }
    getDbManagerType() {
        return '';
    }
    getEntitiesByFilters() {
        throw new Error('Not implemented');
    }
    getEntitiesByIds() {
        throw new Error('Not implemented');
    }
    getEntityCount() {
        throw new Error('Not implemented');
    }
    getEntitiesByField() {
        throw new Error('Not implemented');
    }
    getEntityById() {
        throw new Error('Not implemented');
    }
    getEntityByField() {
        throw new Error('Not implemented');
    }
    getIdColumnType() {
        return '';
    }
    getFirstSubEntityOfEntityById() {
        throw new Error('Not implemented');
    }
    getTimestampType() {
        return '';
    }
    getVarCharType() {
        return '';
    }
    isDbReady() {
        return Promise.resolve(false);
    }
    removeSubEntitiesByJsonPathFromEntityById() {
        throw new Error('Not implemented');
    }
    removeSubEntityByIdFromEntityById() {
        throw new Error('Not implemented');
    }
    tryExecute() {
        throw new Error('Not implemented');
    }
    tryExecuteSql() {
        throw new Error('Not implemented');
    }
    tryExecuteSqlWithoutCls() {
        throw new Error('Not implemented');
    }
    tryReleaseDbConnectionBackToPool() {
    }
    tryReserveDbConnectionFromPool() {
        throw new Error('Not implemented');
    }
    updateEntity() {
        throw new Error('Not implemented');
    }
    updateEntityByField() {
        throw new Error('Not implemented');
    }
    cleanupTransaction() {
    }
    getClient() {
        return undefined;
    }
    tryBeginTransaction() {
        return Promise.resolve(undefined);
    }
    connectMongoDb() {
        return Promise.resolve(undefined);
    }
    disconnectMongoDb() {
        return Promise.resolve(undefined);
    }
    getEntityByFilters() {
        throw new Error('Not implemented');
    }
    isDuplicateEntityError() {
        throw new Error('Not implemented');
    }
    getFilters() {
        throw new Error('Not implemented');
    }
    shouldConvertTinyIntegersToBooleans() {
        return false;
    }
    updateEntitiesByFilters() {
        throw new Error('Not implemented');
    }
    getBooleanType() {
        throw new Error('Not implemented');
    }
    deleteEntityByField() {
        throw new Error('Not implemented');
    }
    removeSubEntityByIdFromEntityByFilters() {
        throw new Error('Not implemented');
    }
    addEntityArrayFieldValues() {
        throw new Error('Not implemented');
    }
    removeEntityArrayFieldValues() {
        throw new Error('Not implemented');
    }
    removeSubEntitiesByJsonPathFromEntityByFilters() {
        throw new Error('Not implemented');
    }
    addSubEntitiesToEntityByFilters() {
        throw new Error('Not implemented');
    }
    addSubEntityToEntityByFilters() {
        throw new Error('Not implemented');
    }
    doesEntityArrayFieldContainValue() {
        throw new Error('Not implemented');
    }
}
exports.default = NoOpDbManager;
//# sourceMappingURL=NoOpDbManager.js.map