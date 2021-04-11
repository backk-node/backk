"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hashAndEncryptEntity_1 = __importDefault(require("../../../../crypt/hashAndEncryptEntity"));
const forEachAsyncSequential_1 = __importDefault(require("../../../../utils/forEachAsyncSequential"));
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const getEntityById_1 = __importDefault(require("../dql/getEntityById"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../utils/type/isEntityTypeName"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const getSubEntitiesByAction_1 = __importDefault(require("./utils/getSubEntitiesByAction"));
const deleteEntityById_1 = __importDefault(require("./deleteEntityById"));
const createEntity_1 = __importDefault(require("./createEntity"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const getSingularName_1 = __importDefault(require("../../../../utils/getSingularName"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
const tryExecutePreHooks_1 = __importDefault(require("../../../hooks/tryExecutePreHooks"));
async function updateEntity(dbManager, { _id, id, ...restOfEntity }, EntityClass, preHooks, entityPreHooks, postHook, postQueryOperations, isRecursiveCall = false) {
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        const Types = dbManager.getTypes();
        if (!isRecursiveCall) {
            await hashAndEncryptEntity_1.default(restOfEntity, EntityClass, Types);
        }
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        let currentEntity;
        let error;
        if (!isRecursiveCall) {
            [currentEntity, error] = await getEntityById_1.default(dbManager, _id !== null && _id !== void 0 ? _id : id, EntityClass, {
                postQueryOperations
            }, true, true);
            if (!currentEntity) {
                throw error;
            }
            let eTagCheckPreHook;
            let finalPreHooks = Array.isArray(entityPreHooks) ? entityPreHooks !== null && entityPreHooks !== void 0 ? entityPreHooks : [] : entityPreHooks ? [entityPreHooks] : [];
            if ('version' in currentEntity && restOfEntity.version && restOfEntity.version !== -1) {
                eTagCheckPreHook = {
                    shouldSucceedOrBeTrue: ({ version }) => version === restOfEntity.version,
                    error: backkErrors_1.BACKK_ERRORS.ENTITY_VERSION_MISMATCH
                };
                finalPreHooks = [eTagCheckPreHook, ...finalPreHooks];
            }
            else if ('lastModifiedTimestamp' in currentEntity &&
                restOfEntity.lastModifiedTimestamp &&
                restOfEntity.lastModifiedTimestamp.getTime() !== 0) {
                eTagCheckPreHook = {
                    shouldSucceedOrBeTrue: ({ lastModifiedTimestamp }) => (lastModifiedTimestamp === null || lastModifiedTimestamp === void 0 ? void 0 : lastModifiedTimestamp.getTime()) === restOfEntity.lastModifiedTimestamp.getTime(),
                    error: backkErrors_1.BACKK_ERRORS.ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH
                };
                finalPreHooks = [eTagCheckPreHook, ...finalPreHooks];
            }
            await tryExecuteEntityPreHooks_1.default(finalPreHooks, currentEntity);
        }
        await tryExecutePreHooks_1.default(preHooks !== null && preHooks !== void 0 ? preHooks : []);
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
        const columns = [];
        const values = [];
        const promises = [];
        await forEachAsyncSequential_1.default(Object.entries(entityMetadata), async ([fieldName, fieldTypeName]) => {
            if (restOfEntity[fieldName] === undefined &&
                fieldName !== 'version' &&
                fieldName !== 'lastModifiedTimestamp') {
                return;
            }
            if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
                return;
            }
            const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
            const foreignIdFieldName = EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';
            const idFieldName = _id === undefined ? 'id' : '_id';
            let subEntityOrEntities = restOfEntity[fieldName];
            const SubEntityClass = Types[baseTypeName];
            if (isArrayType && isEntityTypeName_1.default(baseTypeName)) {
                const finalAllowAdditionAndRemovalForSubEntities = 'all';
                if (finalAllowAdditionAndRemovalForSubEntities === 'all') {
                    const { subEntitiesToDelete, subEntitiesToAdd, subEntitiesToUpdate } = getSubEntitiesByAction_1.default(subEntityOrEntities, currentEntity[fieldName]);
                    promises.push(forEachAsyncParallel_1.default(subEntitiesToDelete, async (subEntity) => {
                        if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
                            const associationTableName = `${EntityClass.name}_${getSingularName_1.default(fieldName)}`;
                            const { entityForeignIdFieldName, subEntityForeignIdFieldName } = entityAnnotationContainer_1.default.getManyToManyRelationTableSpec(associationTableName);
                            await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)} AND ${subEntityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(2)}`, [parseInt(_id !== null && _id !== void 0 ? _id : id, 10), subEntity._id]);
                        }
                        else {
                            const [, error] = await deleteEntityById_1.default(dbManager, subEntity.id, SubEntityClass);
                            if (error) {
                                throw error;
                            }
                        }
                    }));
                    promises.push(forEachAsyncParallel_1.default(subEntitiesToAdd, async (subEntity) => {
                        if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
                            const associationTableName = `${EntityClass.name}_${getSingularName_1.default(fieldName)}`;
                            const { entityForeignIdFieldName, subEntityForeignIdFieldName } = entityAnnotationContainer_1.default.getManyToManyRelationTableSpec(associationTableName);
                            await dbManager.tryExecuteSql(`INSERT INTO ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} (${entityForeignIdFieldName.toLowerCase()}, ${subEntityForeignIdFieldName.toLowerCase()}) VALUES (${dbManager.getValuePlaceholder(1)}, ${dbManager.getValuePlaceholder(2)})`, [parseInt(_id !== null && _id !== void 0 ? _id : id, 10), subEntity._id]);
                        }
                        else {
                            const [, error] = await createEntity_1.default(dbManager, subEntity, SubEntityClass, undefined, undefined, undefined, false, false);
                            if (error) {
                                throw error;
                            }
                        }
                    }));
                    subEntityOrEntities = subEntitiesToUpdate;
                }
                if (!typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
                    promises.push(forEachAsyncParallel_1.default(subEntityOrEntities, async (subEntity) => {
                        subEntity[foreignIdFieldName] = _id;
                        const [, error] = await updateEntity(dbManager, subEntity, SubEntityClass, undefined, undefined, undefined, undefined, true);
                        if (error) {
                            throw error;
                        }
                    }));
                }
            }
            else if (isEntityTypeName_1.default(baseTypeName) && subEntityOrEntities !== null) {
                subEntityOrEntities[foreignIdFieldName] = _id;
                const [, error] = await updateEntity(dbManager, subEntityOrEntities, Types[baseTypeName], undefined, undefined, undefined, undefined, true);
                if (error) {
                    throw error;
                }
            }
            else if (isArrayType) {
                const numericId = parseInt(_id, 10);
                if (isNaN(numericId)) {
                    throw createErrorFromErrorCodeMessageAndStatus_1.default({
                        ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                        message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + idFieldName + ': must be a numeric id'
                    });
                }
                promises.push(forEachAsyncParallel_1.default(restOfEntity[fieldName], async (subItem, index) => {
                    const deleteStatement = `DELETE FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase() +
                        '_' +
                        fieldName
                            .slice(0, -1)
                            .toLowerCase()} WHERE ${foreignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)}`;
                    await dbManager.tryExecuteSql(deleteStatement, [_id]);
                    const insertStatement = `INSERT INTO ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase() +
                        '_' +
                        fieldName
                            .slice(0, -1)
                            .toLowerCase()} (id, ${foreignIdFieldName.toLowerCase()}, ${fieldName
                        .slice(0, -1)
                        .toLowerCase()}) VALUES(${index}, ${dbManager.getValuePlaceholder(1)}, ${dbManager.getValuePlaceholder(2)})`;
                    await dbManager.tryExecuteSql(insertStatement, [_id, subItem]);
                }));
            }
            else if (fieldName !== '_id' && fieldName !== 'id') {
                if (fieldName === 'version' && (currentEntity === null || currentEntity === void 0 ? void 0 : currentEntity.version)) {
                    columns.push(fieldName);
                    values.push(currentEntity.version + 1);
                }
                else if (fieldName === 'lastModifiedTimestamp') {
                    columns.push(fieldName);
                    values.push(new Date());
                }
                else {
                    columns.push(fieldName);
                    values.push(restOfEntity[fieldName]);
                }
            }
        });
        const setStatements = columns
            .map((fieldName, index) => fieldName.toLowerCase() + ' = ' + dbManager.getValuePlaceholder(index + 1))
            .join(', ');
        const idFieldName = _id === undefined ? 'id' : '_id';
        let numericId;
        if (_id !== undefined || id !== undefined) {
            numericId = parseInt(_id !== null && _id !== void 0 ? _id : id, 10);
            if (isNaN(numericId)) {
                throw createErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                    message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + idFieldName + ': must be a numeric id'
                });
            }
        }
        if (setStatements) {
            let sqlStatement = `UPDATE ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} SET ${setStatements}`;
            if (numericId !== undefined) {
                sqlStatement += ` WHERE ${idFieldName} = ${dbManager.getValuePlaceholder(columns.length + 1)}`;
            }
            promises.push(dbManager.tryExecuteQuery(sqlStatement, numericId === undefined ? values : [...values, numericId]));
        }
        await Promise.all(promises);
        if (postHook) {
            await tryExecutePostHook_1.default(postHook, null);
        }
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, null];
    }
    catch (errorOrBackkError) {
        if (isRecursiveCall) {
            throw errorOrBackkError;
        }
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
exports.default = updateEntity;
//# sourceMappingURL=updateEntity.js.map