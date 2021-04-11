"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hashAndEncryptEntity_1 = __importDefault(require("../../../../crypt/hashAndEncryptEntity"));
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../utils/type/isEntityTypeName"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const getSingularName_1 = __importDefault(require("../../../../utils/getSingularName"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecutePreHooks_1 = __importDefault(require("../../../hooks/tryExecutePreHooks"));
const class_transformer_1 = require("class-transformer");
async function createEntity(dbManager, entity, EntityClass, preHooks, postHook, postQueryOperations, isRecursiveCall = false, shouldReturnItem = true) {
    var _a;
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    let sqlStatement;
    entity = class_transformer_1.plainToClass(EntityClass, entity);
    try {
        const Types = dbManager.getTypes();
        if (!isRecursiveCall) {
            await hashAndEncryptEntity_1.default(entity, EntityClass, Types);
        }
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        if (!isRecursiveCall) {
            await tryExecutePreHooks_1.default(preHooks !== null && preHooks !== void 0 ? preHooks : []);
        }
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
        const additionalMetadata = Object.keys(entity)
            .filter((itemKey) => itemKey.endsWith('Id'))
            .reduce((accumulatedMetadata, itemKey) => ({ ...accumulatedMetadata, [itemKey]: 'integer' }), {});
        const columns = [];
        const values = [];
        Object.entries({ ...entityMetadata, ...additionalMetadata }).forEach(([fieldName, fieldTypeName]) => {
            if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
                return;
            }
            const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
            if (!isArrayType && !isEntityTypeName_1.default(baseTypeName) && fieldName !== '_id') {
                columns.push(fieldName);
                if ((fieldName === 'id' || fieldName.endsWith('Id')) &&
                    !typePropertyAnnotationContainer_1.default.isTypePropertyExternalId(EntityClass, fieldName) &&
                    entity[fieldName] !== null) {
                    const numericId = parseInt(entity[fieldName], 10);
                    if (isNaN(numericId)) {
                        throw createErrorFromErrorCodeMessageAndStatus_1.default({
                            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message +
                                EntityClass.name +
                                '.' +
                                fieldName +
                                ': must be a numeric id'
                        });
                    }
                    values.push(numericId);
                }
                else {
                    if (fieldName === 'version') {
                        values.push('1');
                    }
                    else if (fieldName === 'lastModifiedTimestamp' || fieldName === 'createdAtTimestamp') {
                        values.push(new Date());
                    }
                    else {
                        if (entity[fieldName] === undefined) {
                            throw new Error(EntityClass.name +
                                '.' +
                                fieldName +
                                " is a readonly field. Value must be provided for that field in backend call to DbManager's createEntity method.");
                        }
                        values.push(entity[fieldName]);
                    }
                }
            }
        });
        const sqlColumns = columns.map((fieldName) => fieldName.toLowerCase()).join(', ');
        const sqlValuePlaceholders = columns
            .map((_, index) => dbManager.getValuePlaceholder(index + 1))
            .join(', ');
        const getIdSqlStatement = dbManager.getReturningIdClause('_id');
        sqlStatement = `INSERT INTO ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} (${sqlColumns}) VALUES (${sqlValuePlaceholders}) ${getIdSqlStatement}`;
        const result = await dbManager.tryExecuteQuery(sqlStatement, values);
        const _id = (_a = dbManager.getInsertId(result, '_id')) === null || _a === void 0 ? void 0 : _a.toString();
        await forEachAsyncParallel_1.default(Object.entries(entityMetadata), async ([fieldName, fieldTypeName]) => {
            var _a;
            const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
            const foreignIdFieldName = EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';
            const subEntityOrEntities = entity[fieldName];
            if (isArrayType && isEntityTypeName_1.default(baseTypeName)) {
                await forEachAsyncParallel_1.default(subEntityOrEntities !== null && subEntityOrEntities !== void 0 ? subEntityOrEntities : [], async (subEntity, index) => {
                    const SubEntityClass = Types[baseTypeName];
                    if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
                        const associationTableName = `${EntityClass.name}_${getSingularName_1.default(fieldName)}`;
                        const { entityForeignIdFieldName, subEntityForeignIdFieldName } = entityAnnotationContainer_1.default.getManyToManyRelationTableSpec(associationTableName);
                        await dbManager.tryExecuteSql(`INSERT INTO ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} (${entityForeignIdFieldName.toLowerCase()}, ${subEntityForeignIdFieldName.toLowerCase()}) VALUES (${dbManager.getValuePlaceholder(1)}, ${dbManager.getValuePlaceholder(2)})`, [_id, subEntity._id]);
                    }
                    else {
                        subEntity[foreignIdFieldName] = _id;
                        if (subEntity.id === undefined) {
                            subEntity.id = index;
                        }
                        else {
                            if (parseInt(subEntity.id, 10) !== index) {
                                throw createErrorFromErrorCodeMessageAndStatus_1.default({
                                    ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                                    message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message +
                                        EntityClass.name +
                                        '.' +
                                        fieldName +
                                        ': id values must be consecutive numbers starting from zero'
                                });
                            }
                        }
                        const [, error] = await createEntity(dbManager, subEntity, SubEntityClass, preHooks, postHook, postQueryOperations, true, false);
                        if (error) {
                            throw error;
                        }
                    }
                });
            }
            else if (isEntityTypeName_1.default(baseTypeName) && subEntityOrEntities !== null) {
                const relationEntityName = baseTypeName;
                subEntityOrEntities[foreignIdFieldName] = _id;
                const [, error] = await createEntity(dbManager, subEntityOrEntities, Types[relationEntityName], preHooks, postHook, postQueryOperations, true, false);
                if (error) {
                    throw error;
                }
            }
            else if (isArrayType) {
                await forEachAsyncParallel_1.default((_a = entity[fieldName]) !== null && _a !== void 0 ? _a : [], async (subItem, index) => {
                    const insertStatement = `INSERT INTO ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase() +
                        '_' +
                        fieldName
                            .slice(0, -1)
                            .toLowerCase()} (id, ${foreignIdFieldName.toLowerCase()}, ${fieldName
                        .slice(0, -1)
                        .toLowerCase()}) VALUES(${index}, ${dbManager.getValuePlaceholder(1)}, ${dbManager.getValuePlaceholder(2)})`;
                    await dbManager.tryExecuteSql(insertStatement, [_id, subItem]);
                });
            }
        });
        const [createdEntity, error] = isRecursiveCall || !shouldReturnItem
            ? [{ _id }, null]
            : await dbManager.getEntityById(EntityClass, _id, { postQueryOperations });
        if (!isRecursiveCall && postHook) {
            await tryExecutePostHook_1.default(postHook, createdEntity);
        }
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [createdEntity, error];
    }
    catch (errorOrBackkError) {
        if (isRecursiveCall) {
            throw errorOrBackkError;
        }
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        if (dbManager.isDuplicateEntityError(errorOrBackkError)) {
            return [
                null,
                createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.DUPLICATE_ENTITY,
                    message: `Duplicate ${EntityClass.name.charAt(0).toLowerCase()}${EntityClass.name.slice(1)}`
                })
            ];
        }
        return [
            null,
            isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)
        ];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = createEntity;
//# sourceMappingURL=createEntity.js.map