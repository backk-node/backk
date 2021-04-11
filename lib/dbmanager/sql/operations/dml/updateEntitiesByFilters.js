"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDbQuery_1 = __importDefault(require("../../../mongodb/MongoDbQuery"));
const convertFilterObjectToSqlEquals_1 = __importDefault(require("../dql/utils/convertFilterObjectToSqlEquals"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryGetWhereClause_1 = __importDefault(require("../dql/clauses/tryGetWhereClause"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const getFilterValues_1 = __importDefault(require("../dql/utils/getFilterValues"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
async function updateEntitiesByFilters(dbManager, filters, update, EntityClass) {
    if (typeof filters === 'object' && !Array.isArray(filters)) {
        filters = convertFilterObjectToSqlEquals_1.default(filters);
    }
    else if (filters.find((filter) => filter instanceof MongoDbQuery_1.default)) {
        throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
    }
    const nonRootFilters = filters.find((filter) => filter.subEntityPath !== '');
    if (nonRootFilters) {
        throw new Error('All filters must have subEntityPath empty, ie. they must be root filters');
    }
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        const whereClause = tryGetWhereClause_1.default(dbManager, '', filters);
        const filterValues = getFilterValues_1.default(filters);
        const setStatements = Object.keys(update)
            .map((fieldName) => fieldName.toLowerCase() + ' = :yy' + fieldName);
        const updateValues = Object.entries(update).reduce((updateValues, [fieldName, fieldValue]) => ({
            ...updateValues,
            [`yy${fieldName}`]: fieldValue
        }), {});
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
        if (Object.keys(entityMetadata).find(fieldName => fieldName === 'version')) {
            setStatements.push('version = version + 1');
        }
        if (Object.keys(entityMetadata).find(fieldName => fieldName === 'lastModifiedTimestamp')) {
            setStatements.push('lastmodifiedtimestamp = current_timestamp');
        }
        const setStatement = setStatements.join(', ');
        const sqlStatement = `UPDATE ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} SET ${setStatement} ${whereClause}`;
        await dbManager.tryExecuteQueryWithNamedParameters(sqlStatement, { ...filterValues, ...updateValues });
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, null];
    }
    catch (errorOrBackkError) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [
            null,
            isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)
        ];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = updateEntitiesByFilters;
//# sourceMappingURL=updateEntitiesByFilters.js.map