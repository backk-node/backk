"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const SqlExpression_1 = __importDefault(require("./sql/expressions/SqlExpression"));
const AbstractDbManager_1 = __importDefault(require("./AbstractDbManager"));
const createBackkErrorFromError_1 = __importDefault(require("../errors/createBackkErrorFromError"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("./sql/operations/transaction/tryStartLocalTransactionIfNeeded"));
const tryExecutePreHooks_1 = __importDefault(require("./hooks/tryExecutePreHooks"));
const hashAndEncryptEntity_1 = __importDefault(require("../crypt/hashAndEncryptEntity"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("./sql/operations/transaction/cleanupLocalTransactionIfNeeded"));
const cls_hooked_1 = require("cls-hooked");
const defaultServiceMetrics_1 = __importDefault(require("../observability/metrics/defaultServiceMetrics"));
const createInternalServerError_1 = __importDefault(require("../errors/createInternalServerError"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
const isEntityTypeName_1 = __importDefault(require("../utils/type/isEntityTypeName"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
const forEachAsyncSequential_1 = __importDefault(require("../utils/forEachAsyncSequential"));
const startDbOperation_1 = __importDefault(require("./utils/startDbOperation"));
const recordDbOperationDuration_1 = __importDefault(require("./utils/recordDbOperationDuration"));
const jsonpath_plus_1 = require("jsonpath-plus");
const findParentEntityAndPropertyNameForSubEntity_1 = __importDefault(require("../metadata/findParentEntityAndPropertyNameForSubEntity"));
const class_validator_1 = require("class-validator");
const performPostQueryOperations_1 = __importDefault(require("./mongodb/performPostQueryOperations"));
const DefaultPostQueryOperations_1 = __importDefault(require("../types/postqueryoperations/DefaultPostQueryOperations"));
const tryFetchAndAssignSubEntitiesForManyToManyRelationships_1 = __importDefault(require("./mongodb/tryFetchAndAssignSubEntitiesForManyToManyRelationships"));
const decryptEntities_1 = __importDefault(require("../crypt/decryptEntities"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./sql/operations/dql/utils/updateDbLocalTransactionCount"));
const shouldUseRandomInitializationVector_1 = __importDefault(require("../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../crypt/encrypt"));
const removePrivateProperties_1 = __importDefault(require("./mongodb/removePrivateProperties"));
const replaceIdStringsWithObjectIds_1 = __importDefault(require("./mongodb/replaceIdStringsWithObjectIds"));
const removeSubEntities_1 = __importDefault(require("./mongodb/removeSubEntities"));
const getJoinPipelines_1 = __importDefault(require("./mongodb/getJoinPipelines"));
const convertUserDefinedFiltersToMatchExpression_1 = __importDefault(require("./mongodb/convertUserDefinedFiltersToMatchExpression"));
const isUniqueField_1 = __importDefault(require("./sql/operations/dql/utils/isUniqueField"));
const MongoDbQuery_1 = __importDefault(require("./mongodb/MongoDbQuery"));
const getRootOperations_1 = __importDefault(require("./mongodb/getRootOperations"));
const convertMongoDbQueriesToMatchExpression_1 = __importDefault(require("./mongodb/convertMongoDbQueriesToMatchExpression"));
const paginateSubEntities_1 = __importDefault(require("./mongodb/paginateSubEntities"));
const convertFilterObjectToMongoDbQueries_1 = __importDefault(require("./mongodb/convertFilterObjectToMongoDbQueries"));
const tryExecutePostHook_1 = __importDefault(require("./hooks/tryExecutePostHook"));
const getTableName_1 = __importDefault(require("./utils/getTableName"));
const getFieldOrdering_1 = __importDefault(require("./mongodb/getFieldOrdering"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
const isBackkError_1 = __importDefault(require("../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("./hooks/tryExecuteEntityPreHooks"));
const handleNestedManyToManyRelations_1 = __importDefault(require("./mongodb/handleNestedManyToManyRelations"));
const handleNestedOneToManyRelations_1 = __importDefault(require("./mongodb/handleNestedOneToManyRelations"));
const addSimpleSubEntitiesOrValuesByEntityId_1 = __importDefault(require("./mongodb/addSimpleSubEntitiesOrValuesByEntityId"));
const removeSimpleSubEntityById_1 = __importDefault(require("./mongodb/removeSimpleSubEntityById"));
const removeSimpleSubEntityByIdFromEntityByFilters_1 = __importDefault(require("./mongodb/removeSimpleSubEntityByIdFromEntityByFilters"));
const getEntitiesByFilters_1 = __importDefault(require("./mongodb/operations/dql/getEntitiesByFilters"));
const removeFieldValues_1 = __importDefault(require("./mongodb/removeFieldValues"));
const constants_1 = require("../constants/constants");
const findSubEntityClass_1 = __importDefault(require("../utils/type/findSubEntityClass"));
const getEntityByFiltes_1 = __importDefault(require("./mongodb/operations/dql/getEntityByFiltes"));
const addSimpleSubEntitiesOrValuesByFilters_1 = __importDefault(require("./mongodb/addSimpleSubEntitiesOrValuesByFilters"));
let MongoDbManager = class MongoDbManager extends AbstractDbManager_1.default {
    constructor(uri, dbName) {
        super('');
        this.uri = uri;
        this.dbName = dbName;
        this.mongoClient = new mongodb_1.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    getClient() {
        return this.mongoClient;
    }
    getIdColumnType() {
        throw new Error('Not implemented');
    }
    getTimestampType() {
        throw new Error('Not implemented');
    }
    getVarCharType() {
        throw new Error('Not implemented');
    }
    getBooleanType() {
        throw new Error('Not implemented');
    }
    isDuplicateEntityError() {
        return false;
    }
    getModifyColumnStatement() {
        throw new Error('Not implemented');
    }
    getFilters(mongoDbFilters) {
        return Array.isArray(mongoDbFilters) ? mongoDbFilters : [new MongoDbQuery_1.default(mongoDbFilters)];
    }
    async tryExecute(shouldUseTransaction, executeDbOperations) {
        var _a, _b, _c;
        if (((_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('remoteServiceCallCount')) > 0) {
            (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('dbManagerOperationAfterRemoteServiceCall', true);
        }
        try {
            if (shouldUseTransaction) {
                const session = (_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('session');
                if (!session) {
                    throw new Error('Session not set');
                }
                let result;
                await session.withTransaction(async () => {
                    result = await executeDbOperations(this.mongoClient);
                });
                return result;
            }
            else {
                return await executeDbOperations(this.mongoClient);
            }
        }
        catch (error) {
            throw error;
        }
    }
    tryExecuteSql() {
        throw new Error('Not implemented');
    }
    tryExecuteSqlWithoutCls() {
        throw new Error('Not implemented');
    }
    getDbManagerType() {
        return 'MongoDB';
    }
    getDbHost() {
        return this.uri;
    }
    async isDbReady() {
        try {
            await this.tryReserveDbConnectionFromPool();
            await this.tryExecute(false, (client) => client
                .db(this.dbName)
                .collection('__backk__')
                .findOne({}));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async tryBeginTransaction() {
        var _a, _b;
        try {
            const session = this.getClient().startSession();
            (_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.set('session', session);
        }
        catch (error) {
            try {
                await this.mongoClient.close();
            }
            catch (error) {
            }
            this.mongoClient = new mongodb_1.MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
            await this.tryReserveDbConnectionFromPool();
            (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('session', this.getClient().startSession());
        }
    }
    cleanupTransaction() {
        var _a, _b;
        (_b = (_a = this.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('session')) === null || _b === void 0 ? void 0 : _b.endSession();
    }
    async executeInsideTransaction(executable) {
        var _a, _b, _c, _d;
        if ((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) {
            return executable();
        }
        (_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.set('globalTransaction', true);
        let result = [null, createInternalServerError_1.default('Transaction execution error')];
        try {
            await this.tryBeginTransaction();
            const session = (_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('session');
            await session.withTransaction(async () => {
                result = await executable();
            });
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
        finally {
            this.cleanupTransaction();
        }
        (_d = this.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.set('globalTransaction', false);
        return result;
    }
    async createEntity(EntityClass, entity, options, isInternalCall = false) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'createEntity');
        EntityClass = this.getType(EntityClass);
        const Types = this.getTypes();
        let shouldUseTransaction = false;
        try {
            await hashAndEncryptEntity_1.default(entity, EntityClass, Types);
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
                Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
                    var _a;
                    if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
                        delete entity[fieldName];
                    }
                    const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
                    if (!isArrayType && !isEntityTypeName_1.default(baseTypeName) && fieldName !== '_id') {
                        if (fieldName === 'version') {
                            entity.version = 1;
                        }
                        else if (fieldName === 'lastModifiedTimestamp' || fieldName === 'createdAtTimestamp') {
                            entity[fieldName] = new Date();
                        }
                    }
                    else if (isArrayType &&
                        isEntityTypeName_1.default(baseTypeName) &&
                        typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
                        entity[fieldName] = ((_a = entity[fieldName]) !== null && _a !== void 0 ? _a : []).map((subEntity) => subEntity._id);
                    }
                    else if (isEntityTypeName_1.default(baseTypeName)) {
                        handleNestedManyToManyRelations_1.default(entity, Types, Types[baseTypeName], fieldName);
                    }
                });
                await tryExecutePreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.preHooks) !== null && _a !== void 0 ? _a : []);
                let createEntityResult;
                try {
                    createEntityResult = await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .insertOne(entity);
                }
                catch (error) {
                    if (error.message.startsWith('E11000 duplicate key error')) {
                        return [
                            null,
                            createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                                ...backkErrors_1.BACKK_ERRORS.DUPLICATE_ENTITY,
                                message: `Duplicate ${EntityClass.name.charAt(0).toLowerCase()}${EntityClass.name.slice(1)}`
                            })
                        ];
                    }
                    throw error;
                }
                const _id = createEntityResult === null || createEntityResult === void 0 ? void 0 : createEntityResult.insertedId.toHexString();
                const [createdEntity, error] = isInternalCall
                    ? [{ _id }, null]
                    : await this.getEntityById(EntityClass, _id, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations });
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, createdEntity);
                }
                return [createdEntity, error];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    addSubEntityToEntityById(subEntityPath, subEntity, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntityToEntityById');
        const response = this.addSubEntitiesToEntityById(subEntityPath, [subEntity], EntityClass, _id, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    addSubEntityToEntityByFilters(subEntityPath, subEntity, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntityToEntityByFilters');
        const response = this.addSubEntitiesToEntityByFilters(subEntityPath, [subEntity], EntityClass, filters, options);
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addSubEntitiesToEntityById(subEntityPath, subEntities, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntitiesToEntityById');
        EntityClass = this.getType(EntityClass);
        const SubEntityClass = findSubEntityClass_1.default(subEntityPath, EntityClass, this.getTypes());
        if (!SubEntityClass) {
            throw new Error('Invalid subEntityPath: ' + subEntityPath);
        }
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                const isNonNestedColumnName = subEntityPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
                let updateError;
                if (isNonNestedColumnName) {
                    [, updateError] = await addSimpleSubEntitiesOrValuesByEntityId_1.default(client, this, _id, subEntityPath, subEntities, EntityClass, options);
                }
                else {
                    let [currentEntity, error] = await this.getEntityById(EntityClass, _id, undefined, true, true);
                    if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.NOT_FOUND && (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundUse)) {
                        [currentEntity, error] = await options.ifEntityNotFoundUse();
                    }
                    if (!currentEntity) {
                        return [null, error];
                    }
                    await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
                    const [parentEntity] = jsonpath_plus_1.JSONPath({
                        json: currentEntity,
                        path: subEntityPath + '^'
                    });
                    const [subEntities] = jsonpath_plus_1.JSONPath({ json: currentEntity, path: subEntityPath });
                    const maxSubItemId = subEntities.reduce((maxSubItemId, subEntity) => {
                        const subItemId = parseInt(subEntity.id, 10);
                        return subItemId > maxSubItemId ? subItemId : maxSubItemId;
                    }, -1);
                    const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity_1.default(EntityClass, SubEntityClass, this.getTypes());
                    if (parentEntityClassAndPropertyNameForSubEntity) {
                        const metadataForValidations = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(parentEntityClassAndPropertyNameForSubEntity[0], '');
                        const foundArrayMaxSizeValidation = metadataForValidations.find((validationMetadata) => validationMetadata.propertyName === parentEntityClassAndPropertyNameForSubEntity[1] &&
                            validationMetadata.type === 'arrayMaxSize');
                        if (foundArrayMaxSizeValidation &&
                            maxSubItemId + subEntities.length >= foundArrayMaxSizeValidation.constraints[0]) {
                            throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                                ...backkErrors_1.BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED,
                                message: parentEntityClassAndPropertyNameForSubEntity[0].name +
                                    '.' +
                                    parentEntityClassAndPropertyNameForSubEntity[1] +
                                    ': ' +
                                    backkErrors_1.BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message
                            });
                        }
                    }
                    await forEachAsyncParallel_1.default(subEntities, async (newSubEntity, index) => {
                        if (parentEntityClassAndPropertyNameForSubEntity &&
                            typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(parentEntityClassAndPropertyNameForSubEntity[0], parentEntityClassAndPropertyNameForSubEntity[1])) {
                            parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push(newSubEntity);
                        }
                        else if (parentEntityClassAndPropertyNameForSubEntity) {
                            parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push({
                                ...newSubEntity,
                                id: (maxSubItemId + 1 + index).toString()
                            });
                        }
                    });
                    [, updateError] = await this.updateEntity(EntityClass, currentEntity, undefined);
                }
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
                }
                return [null, updateError];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async addSubEntitiesToEntityByFilters(subEntityPath, subEntities, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addSubEntitiesToEntityById');
        EntityClass = this.getType(EntityClass);
        const SubEntityClass = findSubEntityClass_1.default(subEntityPath, EntityClass, this.getTypes());
        if (!SubEntityClass) {
            throw new Error('Invalid subEntityPath: ' + subEntityPath);
        }
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                const isNonNestedColumnName = subEntityPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
                let updateError;
                if (isNonNestedColumnName) {
                    [, updateError] = await addSimpleSubEntitiesOrValuesByFilters_1.default(client, this, filters, subEntityPath, subEntities, EntityClass, options);
                }
                else {
                    let [currentEntity, error] = await this.getEntityByFilters(EntityClass, filters, undefined, true, true);
                    if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.NOT_FOUND && (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundUse)) {
                        [currentEntity, error] = await options.ifEntityNotFoundUse();
                    }
                    if (!currentEntity) {
                        return [null, error];
                    }
                    await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
                    const [parentEntity] = jsonpath_plus_1.JSONPath({
                        json: currentEntity,
                        path: subEntityPath + '^'
                    });
                    const [subEntities] = jsonpath_plus_1.JSONPath({ json: currentEntity, path: subEntityPath });
                    const maxSubItemId = subEntities.reduce((maxSubItemId, subEntity) => {
                        const subItemId = parseInt(subEntity.id, 10);
                        return subItemId > maxSubItemId ? subItemId : maxSubItemId;
                    }, -1);
                    const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity_1.default(EntityClass, SubEntityClass, this.getTypes());
                    if (parentEntityClassAndPropertyNameForSubEntity) {
                        const metadataForValidations = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(parentEntityClassAndPropertyNameForSubEntity[0], '');
                        const foundArrayMaxSizeValidation = metadataForValidations.find((validationMetadata) => validationMetadata.propertyName === parentEntityClassAndPropertyNameForSubEntity[1] &&
                            validationMetadata.type === 'arrayMaxSize');
                        if (foundArrayMaxSizeValidation &&
                            maxSubItemId + subEntities.length >= foundArrayMaxSizeValidation.constraints[0]) {
                            throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                                ...backkErrors_1.BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED,
                                message: parentEntityClassAndPropertyNameForSubEntity[0].name +
                                    '.' +
                                    parentEntityClassAndPropertyNameForSubEntity[1] +
                                    ': ' +
                                    backkErrors_1.BACKK_ERRORS.MAX_ENTITY_COUNT_REACHED.message
                            });
                        }
                    }
                    await forEachAsyncParallel_1.default(subEntities, async (newSubEntity, index) => {
                        if (parentEntityClassAndPropertyNameForSubEntity &&
                            typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(parentEntityClassAndPropertyNameForSubEntity[0], parentEntityClassAndPropertyNameForSubEntity[1])) {
                            parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push(newSubEntity);
                        }
                        else if (parentEntityClassAndPropertyNameForSubEntity) {
                            parentEntity[parentEntityClassAndPropertyNameForSubEntity[1]].push({
                                ...newSubEntity,
                                id: (maxSubItemId + 1 + index).toString()
                            });
                        }
                    });
                    [, updateError] = await this.updateEntity(EntityClass, currentEntity, undefined);
                }
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
                }
                return [null, updateError];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async getAllEntities(EntityClass, options) {
        var _a, _b, _c, _d;
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getAllEntities');
        updateDbLocalTransactionCount_1.default(this);
        EntityClass = this.getType(EntityClass);
        const finalPostQueryOperations = (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) !== null && _a !== void 0 ? _a : new DefaultPostQueryOperations_1.default();
        try {
            let isSelectForUpdate = false;
            if (((_b = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('globalTransaction')) || ((_d = this.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.get('localTransaction'))) {
                isSelectForUpdate = true;
            }
            const entities = await this.tryExecute(false, async (client) => {
                if (isSelectForUpdate) {
                    await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .updateMany({}, { $set: { _backkLock: new mongodb_1.ObjectId() } });
                }
                const joinPipelines = getJoinPipelines_1.default(EntityClass, this.getTypes());
                const cursor = client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .aggregate([...joinPipelines, getFieldOrdering_1.default(EntityClass)])
                    .match({});
                performPostQueryOperations_1.default(cursor, finalPostQueryOperations, EntityClass, this.getTypes());
                const rows = await cursor.toArray();
                await tryFetchAndAssignSubEntitiesForManyToManyRelationships_1.default(this, rows, EntityClass, this.getTypes(), undefined, finalPostQueryOperations);
                paginateSubEntities_1.default(rows, finalPostQueryOperations.paginations, EntityClass, this.getTypes());
                removePrivateProperties_1.default(rows, EntityClass, this.getTypes());
                decryptEntities_1.default(rows, EntityClass, this.getTypes(), false);
                return rows;
            });
            return [entities, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    getEntitiesByFilters(EntityClass, filters, options) {
        return getEntitiesByFilters_1.default(this, filters, EntityClass, options);
    }
    async getEntityByFilters(EntityClass, filters, options, isSelectForUpdate = false, isInternalCall = false) {
        return getEntityByFiltes_1.default(this, filters, EntityClass, options, isSelectForUpdate, isInternalCall);
    }
    async getEntityCount(EntityClass, filters) {
        let matchExpression;
        let finalFilters;
        if (typeof filters === 'object' && !Array.isArray(filters)) {
            finalFilters = convertFilterObjectToMongoDbQueries_1.default(filters);
        }
        else if (filters) {
            finalFilters = filters;
        }
        else {
            finalFilters = [];
        }
        if (Array.isArray(finalFilters) && (finalFilters === null || finalFilters === void 0 ? void 0 : finalFilters.find((filter) => filter instanceof SqlExpression_1.default))) {
            throw new Error('SqlExpression is not supported for MongoDB');
        }
        else {
            const rootFilters = getRootOperations_1.default(finalFilters, EntityClass, this.getTypes());
            const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery_1.default));
            const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery_1.default);
            const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression_1.default(rootUserDefinedFilters);
            const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootMongoDbQueries);
            matchExpression = {
                ...userDefinedFiltersMatchExpression,
                ...mongoDbQueriesMatchExpression
            };
        }
        replaceIdStringsWithObjectIds_1.default(matchExpression);
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityCount');
        EntityClass = this.getType(EntityClass);
        try {
            const entityCount = await this.tryExecute(false, async (client) => {
                return client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .countDocuments(matchExpression);
            });
            return [entityCount, null];
        }
        catch (error) {
            return [null, createBackkErrorFromError_1.default(error)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async getEntityById(EntityClass, _id, options, isSelectForUpdate = false, isInternalCall = false) {
        var _a, _b, _c, _d, _e;
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityById');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            if (((_b = (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) === null || _a === void 0 ? void 0 : _a.includeResponseFields) === null || _b === void 0 ? void 0 : _b.length) === 1 &&
                (options === null || options === void 0 ? void 0 : options.postQueryOperations.includeResponseFields[0]) === '_id') {
                return [{ _id }, null];
            }
            if ((options === null || options === void 0 ? void 0 : options.postHook) || (options === null || options === void 0 ? void 0 : options.preHooks) || (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn)) {
                shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            }
            updateDbLocalTransactionCount_1.default(this);
            if (((_c = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _c === void 0 ? void 0 : _c.get('globalTransaction')) || ((_d = this.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.get('globalTransaction')) || ((_e = this.getClsNamespace()) === null || _e === void 0 ? void 0 : _e.get('localTransaction'))) {
                isSelectForUpdate = true;
            }
            const entities = await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                if (isSelectForUpdate) {
                    await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .findOneAndUpdate({ _id: new mongodb_1.ObjectId(_id) }, { $set: { _backkLock: new mongodb_1.ObjectId() } });
                }
                if (options === null || options === void 0 ? void 0 : options.preHooks) {
                    await tryExecutePreHooks_1.default(options.preHooks);
                }
                const joinPipelines = getJoinPipelines_1.default(EntityClass, this.getTypes());
                const cursor = client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .aggregate([...joinPipelines, getFieldOrdering_1.default(EntityClass)])
                    .match({ _id: new mongodb_1.ObjectId(_id) });
                performPostQueryOperations_1.default(cursor, options === null || options === void 0 ? void 0 : options.postQueryOperations, EntityClass, this.getTypes());
                const rows = await cursor.toArray();
                await tryFetchAndAssignSubEntitiesForManyToManyRelationships_1.default(this, rows, EntityClass, this.getTypes(), undefined, options === null || options === void 0 ? void 0 : options.postQueryOperations, isInternalCall);
                paginateSubEntities_1.default(rows, (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) === null || _a === void 0 ? void 0 : _a.paginations, EntityClass, this.getTypes());
                removePrivateProperties_1.default(rows, EntityClass, this.getTypes(), isInternalCall);
                decryptEntities_1.default(rows, EntityClass, this.getTypes(), false);
                return rows;
            });
            let entity, error = null;
            if (entities.length === 0) {
                if (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn) {
                    [entity, error] = await options.ifEntityNotFoundReturn();
                    entities.push(entity);
                }
                else {
                    return [
                        null,
                        createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                            ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                            message: `${EntityClass.name} with _id: ${_id} not found`
                        })
                    ];
                }
            }
            if (options === null || options === void 0 ? void 0 : options.postHook) {
                await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, entities[0]);
            }
            return [entities[0], error];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async getEntitiesByIds(EntityClass, _ids, options) {
        var _a, _b, _c;
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntitiesByIds');
        updateDbLocalTransactionCount_1.default(this);
        EntityClass = this.getType(EntityClass);
        try {
            let isSelectForUpdate = false;
            if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
                isSelectForUpdate = true;
            }
            const entities = await this.tryExecute(false, async (client) => {
                var _a;
                if (isSelectForUpdate) {
                    await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .updateMany({ _id: { $in: _ids.map((_id) => new mongodb_1.ObjectId(_id)) } }, { $set: { _backkLock: new mongodb_1.ObjectId() } });
                }
                const joinPipelines = getJoinPipelines_1.default(EntityClass, this.getTypes());
                const cursor = client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .aggregate([...joinPipelines, getFieldOrdering_1.default(EntityClass)])
                    .match({ _id: { $in: _ids.map((_id) => new mongodb_1.ObjectId(_id)) } });
                performPostQueryOperations_1.default(cursor, options === null || options === void 0 ? void 0 : options.postQueryOperations, EntityClass, this.getTypes());
                const rows = await cursor.toArray();
                await tryFetchAndAssignSubEntitiesForManyToManyRelationships_1.default(this, rows, EntityClass, this.getTypes(), undefined, options === null || options === void 0 ? void 0 : options.postQueryOperations);
                paginateSubEntities_1.default(rows, (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) === null || _a === void 0 ? void 0 : _a.paginations, EntityClass, this.getTypes());
                removePrivateProperties_1.default(rows, EntityClass, this.getTypes());
                decryptEntities_1.default(rows, EntityClass, this.getTypes(), false);
                return rows;
            });
            return [entities, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async getEntityByField(EntityClass, fieldPathName, fieldValue, options, isSelectForUpdate = false, isInternalCall = false) {
        var _a, _b, _c;
        if (!isUniqueField_1.default(fieldPathName, EntityClass, this.getTypes())) {
            throw new Error(`Field ${fieldPathName} is not unique. Annotate entity field with @Unique annotation`);
        }
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntityByField');
        let finalFieldValue = fieldValue;
        const lastDotPosition = fieldPathName.lastIndexOf('.');
        const fieldName = lastDotPosition === -1 ? fieldPathName : fieldPathName.slice(lastDotPosition + 1);
        if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
            finalFieldValue = encrypt_1.default(fieldValue, false);
        }
        const filters = [
            new MongoDbQuery_1.default({ [fieldName]: finalFieldValue }, lastDotPosition === -1 ? '' : fieldPathName.slice(0, lastDotPosition))
        ];
        const rootFilters = getRootOperations_1.default(filters, EntityClass, this.getTypes());
        const matchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootFilters);
        let shouldUseTransaction = false;
        try {
            if ((options === null || options === void 0 ? void 0 : options.postHook) || (options === null || options === void 0 ? void 0 : options.preHooks) || (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn)) {
                shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            }
            updateDbLocalTransactionCount_1.default(this);
            if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
                isSelectForUpdate = true;
            }
            const entities = await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                if (isSelectForUpdate) {
                    await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .findOneAndUpdate(matchExpression, { $set: { _backkLock: new mongodb_1.ObjectId() } });
                }
                if (options === null || options === void 0 ? void 0 : options.preHooks) {
                    await tryExecutePreHooks_1.default(options.preHooks);
                }
                const joinPipelines = getJoinPipelines_1.default(EntityClass, this.getTypes());
                const cursor = client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .aggregate([...joinPipelines, getFieldOrdering_1.default(EntityClass)])
                    .match(matchExpression);
                performPostQueryOperations_1.default(cursor, options === null || options === void 0 ? void 0 : options.postQueryOperations, EntityClass, this.getTypes());
                const rows = await cursor.toArray();
                await tryFetchAndAssignSubEntitiesForManyToManyRelationships_1.default(this, rows, EntityClass, this.getTypes(), filters, options === null || options === void 0 ? void 0 : options.postQueryOperations, isInternalCall);
                paginateSubEntities_1.default(rows, (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) === null || _a === void 0 ? void 0 : _a.paginations, EntityClass, this.getTypes());
                removePrivateProperties_1.default(rows, EntityClass, this.getTypes(), isInternalCall);
                decryptEntities_1.default(rows, EntityClass, this.getTypes(), false);
                return rows;
            });
            let entity, error = null;
            if (entities.length === 0) {
                if (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn) {
                    [entity, error] = await options.ifEntityNotFoundReturn();
                    entities.push(entity);
                }
                else {
                    return [
                        null,
                        createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                            ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                            message: `${EntityClass.name} with ${fieldName}: ${fieldValue} not found`
                        })
                    ];
                }
            }
            if (options === null || options === void 0 ? void 0 : options.postHook) {
                await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, entities[0]);
            }
            return [entities[0], error];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async getEntitiesByField(EntityClass, fieldPathName, fieldValue, options) {
        var _a, _b, _c;
        if (!isUniqueField_1.default(fieldPathName, EntityClass, this.getTypes())) {
            throw new Error(`Field ${fieldPathName} is not unique. Annotate entity field with @Unique annotation`);
        }
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'getEntitiesByField');
        updateDbLocalTransactionCount_1.default(this);
        let finalFieldValue = fieldValue;
        const lastDotPosition = fieldPathName.lastIndexOf('.');
        const fieldName = lastDotPosition === -1 ? fieldPathName : fieldPathName.slice(lastDotPosition + 1);
        if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
            finalFieldValue = encrypt_1.default(fieldValue, false);
        }
        const filters = [
            new MongoDbQuery_1.default({ [fieldName]: finalFieldValue }, lastDotPosition === -1 ? '' : fieldPathName.slice(0, lastDotPosition))
        ];
        const rootFilters = getRootOperations_1.default(filters, EntityClass, this.getTypes());
        const matchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootFilters);
        try {
            let isSelectForUpdate = false;
            if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
                isSelectForUpdate = true;
            }
            const entities = await this.tryExecute(false, async (client) => {
                var _a;
                if (isSelectForUpdate) {
                    await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .updateMany(matchExpression, { $set: { _backkLock: new mongodb_1.ObjectId() } });
                }
                const joinPipelines = getJoinPipelines_1.default(EntityClass, this.getTypes());
                const cursor = client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .aggregate([...joinPipelines, getFieldOrdering_1.default(EntityClass)])
                    .match(matchExpression);
                performPostQueryOperations_1.default(cursor, options === null || options === void 0 ? void 0 : options.postQueryOperations, EntityClass, this.getTypes());
                const rows = await cursor.toArray();
                await tryFetchAndAssignSubEntitiesForManyToManyRelationships_1.default(this, rows, EntityClass, this.getTypes(), filters, options === null || options === void 0 ? void 0 : options.postQueryOperations);
                paginateSubEntities_1.default(rows, (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) === null || _a === void 0 ? void 0 : _a.paginations, EntityClass, this.getTypes());
                removePrivateProperties_1.default(rows, EntityClass, this.getTypes());
                decryptEntities_1.default(rows, EntityClass, this.getTypes(), false);
                return rows;
            });
            return entities.length === 0
                ? [
                    null,
                    createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                        ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                        message: `${EntityClass.name} with ${fieldName}: ${fieldValue} not found`
                    })
                ]
                : [entities, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async updateEntity(EntityClass, { _id, id, ...restOfEntity }, options, isRecursiveCall = false, isInternalCall = false) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntity');
        EntityClass = this.getType(EntityClass);
        const Types = this.getTypes();
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            if (!isRecursiveCall) {
                await hashAndEncryptEntity_1.default(restOfEntity, EntityClass, Types);
            }
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a, _b;
                let currentEntity = null;
                let error = null;
                if (!isRecursiveCall &&
                    ((options === null || options === void 0 ? void 0 : options.entityPreHooks) || restOfEntity.version || restOfEntity.lastModifiedTimestamp)) {
                    [currentEntity, error] = await this.getEntityById(EntityClass, _id, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
                    if (!currentEntity) {
                        return [null, error];
                    }
                    let eTagCheckPreHook;
                    let finalEntityPreHooks = Array.isArray(options === null || options === void 0 ? void 0 : options.entityPreHooks)
                        ? (_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [] : (options === null || options === void 0 ? void 0 : options.entityPreHooks) ? [options === null || options === void 0 ? void 0 : options.entityPreHooks]
                        : [];
                    if (!isInternalCall && currentEntity) {
                        if ('version' in currentEntity && restOfEntity.version && restOfEntity.version !== -1) {
                            eTagCheckPreHook = {
                                shouldSucceedOrBeTrue: ({ version }) => version === restOfEntity.version,
                                error: backkErrors_1.BACKK_ERRORS.ENTITY_VERSION_MISMATCH
                            };
                            finalEntityPreHooks = [eTagCheckPreHook, ...finalEntityPreHooks];
                        }
                        else if ('lastModifiedTimestamp' in currentEntity &&
                            restOfEntity.lastModifiedTimestamp &&
                            restOfEntity.lastModifiedTimestamp.getTime() !== 0) {
                            eTagCheckPreHook = {
                                shouldSucceedOrBeTrue: ({ lastModifiedTimestamp }) => (lastModifiedTimestamp === null || lastModifiedTimestamp === void 0 ? void 0 : lastModifiedTimestamp.getTime()) === restOfEntity.lastModifiedTimestamp.getTime(),
                                error: backkErrors_1.BACKK_ERRORS.ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH
                            };
                            finalEntityPreHooks = [eTagCheckPreHook, ...finalEntityPreHooks];
                        }
                    }
                    await tryExecuteEntityPreHooks_1.default(finalEntityPreHooks, currentEntity);
                }
                await tryExecutePreHooks_1.default((_b = options === null || options === void 0 ? void 0 : options.preHooks) !== null && _b !== void 0 ? _b : []);
                const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
                await forEachAsyncSequential_1.default(Object.entries(entityMetadata), async ([fieldName, fieldTypeName]) => {
                    var _a;
                    if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
                        delete restOfEntity[fieldName];
                    }
                    const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
                    const newSubEntities = restOfEntity[fieldName];
                    if (isArrayType && isEntityTypeName_1.default(baseTypeName) && newSubEntities) {
                        if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
                            restOfEntity[fieldName] = newSubEntities.map((subEntity) => subEntity._id);
                        }
                        else {
                            handleNestedManyToManyRelations_1.default(restOfEntity, Types, Types[baseTypeName], fieldName);
                            handleNestedOneToManyRelations_1.default(restOfEntity, Types, Types[baseTypeName], fieldName);
                        }
                    }
                    else if (fieldName !== '_id') {
                        if (fieldName === 'version') {
                            restOfEntity[fieldName] =
                                ((_a = currentEntity === null || currentEntity === void 0 ? void 0 : currentEntity.version) !== null && _a !== void 0 ? _a : restOfEntity.version) + 1;
                        }
                        else if (fieldName === 'lastModifiedTimestamp') {
                            restOfEntity[fieldName] = new Date();
                        }
                    }
                });
                const updateOperationResult = await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: restOfEntity });
                if (updateOperationResult.matchedCount !== 1) {
                    return [
                        null,
                        createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                            ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                            message: EntityClass.name + ' with id: ' + _id + ' not found'
                        })
                    ];
                }
                if (!isRecursiveCall && (options === null || options === void 0 ? void 0 : options.postHook)) {
                    await tryExecutePostHook_1.default(options.postHook, null);
                }
                return [null, null];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async updateEntityByFilters(EntityClass, filters, entityUpdate, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntityByFilters');
        EntityClass = this.getType(EntityClass);
        let matchExpression;
        let finalFilters;
        if (typeof filters === 'object' && !Array.isArray(filters)) {
            finalFilters = convertFilterObjectToMongoDbQueries_1.default(filters);
        }
        else {
            finalFilters = filters;
        }
        if (Array.isArray(finalFilters) && (finalFilters === null || finalFilters === void 0 ? void 0 : finalFilters.find((filter) => filter instanceof SqlExpression_1.default))) {
            throw new Error('SqlExpression is not supported for MongoDB');
        }
        else {
            const rootFilters = getRootOperations_1.default(finalFilters, EntityClass, this.getTypes());
            const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery_1.default));
            const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery_1.default);
            const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression_1.default(rootUserDefinedFilters);
            const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootMongoDbQueries);
            matchExpression = {
                ...userDefinedFiltersMatchExpression,
                ...mongoDbQueriesMatchExpression
            };
            replaceIdStringsWithObjectIds_1.default(matchExpression);
        }
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
            let versionUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.version) {
                delete entityUpdate.version;
                versionUpdate = { $inc: { version: 1 } };
            }
            let lastModifiedTimestampUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
                delete entityUpdate.lastModifiedTimestamp;
                lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
            }
            await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                const [currentEntity, error] = await this.getEntityByFilters(EntityClass, filters, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
                if (!currentEntity) {
                    return [null, error];
                }
                await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .updateMany(matchExpression, {
                    ...versionUpdate,
                    ...lastModifiedTimestampUpdate,
                    $set: entityUpdate
                });
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options.postHook, null);
                }
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async updateEntitiesByFilters(EntityClass, filters, entityUpdate) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntityByFilters');
        EntityClass = this.getType(EntityClass);
        let matchExpression;
        let finalFilters;
        if (typeof filters === 'object' && !Array.isArray(filters)) {
            finalFilters = convertFilterObjectToMongoDbQueries_1.default(filters);
        }
        else {
            finalFilters = filters;
        }
        if (Array.isArray(finalFilters) && (finalFilters === null || finalFilters === void 0 ? void 0 : finalFilters.find((filter) => filter instanceof SqlExpression_1.default))) {
            throw new Error('SqlExpression is not supported for MongoDB');
        }
        else {
            const rootFilters = getRootOperations_1.default(finalFilters, EntityClass, this.getTypes());
            const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery_1.default));
            const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery_1.default);
            const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression_1.default(rootUserDefinedFilters);
            const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootMongoDbQueries);
            matchExpression = {
                ...userDefinedFiltersMatchExpression,
                ...mongoDbQueriesMatchExpression
            };
            replaceIdStringsWithObjectIds_1.default(matchExpression);
        }
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
            let versionUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.version) {
                delete entityUpdate.version;
                versionUpdate = { $inc: { version: 1 } };
            }
            let lastModifiedTimestampUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
                delete entityUpdate.lastModifiedTimestamp;
                lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
            }
            await this.tryExecute(shouldUseTransaction, async (client) => {
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .updateMany(matchExpression, {
                    ...versionUpdate,
                    ...lastModifiedTimestampUpdate,
                    $set: entityUpdate
                });
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async updateEntityByField(EntityClass, fieldPathName, fieldValue, entityUpdate, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'updateEntityByField');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            await this.tryExecute(shouldUseTransaction, async () => {
                var _a;
                const [currentEntity, error] = await this.getEntityByField(EntityClass, fieldPathName, fieldValue, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true);
                if (!currentEntity) {
                    return [null, error];
                }
                await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
                await this.updateEntity(EntityClass, { _id: currentEntity._id, ...entityUpdate });
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options.postHook, null);
                }
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async deleteEntityById(EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntityById');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            await this.tryExecute(shouldUseTransaction, async (client) => {
                if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
                    const [currentEntity, error] = await this.getEntityById(EntityClass, _id, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
                    if (!currentEntity) {
                        return [null, error];
                    }
                    await tryExecuteEntityPreHooks_1.default(options === null || options === void 0 ? void 0 : options.entityPreHooks, currentEntity);
                }
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .deleteOne({ _id: new mongodb_1.ObjectId(_id) });
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
                }
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async deleteEntitiesByField(EntityClass, fieldName, fieldValue) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntitiesByField');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            const lastFieldNamePart = fieldName.slice(fieldName.lastIndexOf('.') + 1);
            if (!shouldUseRandomInitializationVector_1.default(lastFieldNamePart) && shouldEncryptValue_1.default(lastFieldNamePart)) {
                fieldValue = encrypt_1.default(fieldValue, false);
            }
            await this.tryExecute(shouldUseTransaction, async (client) => {
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .deleteOne({ [fieldName]: fieldValue });
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async deleteEntityByFilters(EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntitiesByFilters');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        let matchExpression;
        let finalFilters;
        if (typeof filters === 'object' && !Array.isArray(filters)) {
            finalFilters = convertFilterObjectToMongoDbQueries_1.default(filters);
        }
        else {
            finalFilters = filters;
        }
        if (Array.isArray(finalFilters) && (finalFilters === null || finalFilters === void 0 ? void 0 : finalFilters.find((filter) => filter instanceof SqlExpression_1.default))) {
            throw new Error('SqlExpression is not supported for MongoDB');
        }
        else {
            const rootFilters = getRootOperations_1.default(finalFilters, EntityClass, this.getTypes());
            const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery_1.default));
            const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery_1.default);
            const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression_1.default(rootUserDefinedFilters);
            const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootMongoDbQueries);
            matchExpression = {
                ...userDefinedFiltersMatchExpression,
                ...mongoDbQueriesMatchExpression
            };
        }
        replaceIdStringsWithObjectIds_1.default(matchExpression);
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            await this.tryExecute(shouldUseTransaction, async (client) => {
                if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
                    const [currentEntity, error] = await this.getEntityByFilters(EntityClass, filters, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
                    if (!currentEntity) {
                        return [null, error];
                    }
                    await tryExecuteEntityPreHooks_1.default(options === null || options === void 0 ? void 0 : options.entityPreHooks, currentEntity);
                }
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .deleteOne(matchExpression);
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
                }
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async deleteEntitiesByFilters(EntityClass, filters) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntitiesByFilters');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        let matchExpression;
        let finalFilters;
        if (typeof filters === 'object' && !Array.isArray(filters)) {
            finalFilters = convertFilterObjectToMongoDbQueries_1.default(filters);
        }
        else {
            finalFilters = filters;
        }
        if (Array.isArray(finalFilters) && (finalFilters === null || finalFilters === void 0 ? void 0 : finalFilters.find((filter) => filter instanceof SqlExpression_1.default))) {
            throw new Error('SqlExpression is not supported for MongoDB');
        }
        else {
            const rootFilters = getRootOperations_1.default(finalFilters, EntityClass, this.getTypes());
            const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery_1.default));
            const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery_1.default);
            const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression_1.default(rootUserDefinedFilters);
            const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootMongoDbQueries);
            matchExpression = {
                ...userDefinedFiltersMatchExpression,
                ...mongoDbQueriesMatchExpression
            };
        }
        replaceIdStringsWithObjectIds_1.default(matchExpression);
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            await this.tryExecute(shouldUseTransaction, async (client) => {
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .deleteMany(matchExpression);
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async removeSubEntitiesByJsonPathFromEntityById(subEntitiesJsonPath, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntitiesByJsonPathFromEntityById');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                var _a;
                const [currentEntity, error] = await this.getEntityById(EntityClass, _id, undefined, true, true);
                if (!currentEntity) {
                    throw error;
                }
                await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
                const subEntities = jsonpath_plus_1.JSONPath({ json: currentEntity, path: subEntitiesJsonPath });
                let updateError = null;
                if (subEntities.length > 0) {
                    removeSubEntities_1.default(currentEntity, subEntities);
                    [, updateError] = await this.updateEntity(EntityClass, currentEntity, undefined);
                }
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options.postHook, null);
                }
                return [null, updateError];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async removeSubEntityByIdFromEntityById(subEntitiesJsonPath, subEntityId, EntityClass, _id, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntityByIdFromEntityById');
        const isNonNestedColumnName = subEntitiesJsonPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
        let response;
        if (isNonNestedColumnName) {
            response = await removeSimpleSubEntityById_1.default(this, _id, subEntitiesJsonPath, subEntityId, EntityClass, options);
        }
        else {
            const subEntityPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
            response = await this.removeSubEntitiesByJsonPathFromEntityById(subEntityPath, EntityClass, _id, options);
        }
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async deleteAllEntities(EntityClass) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteAllEntities');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            await this.tryExecute(shouldUseTransaction, async (client) => {
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .deleteMany({});
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    tryReleaseDbConnectionBackToPool() {
    }
    async tryReserveDbConnectionFromPool() {
        if (!this.mongoClient.isConnected()) {
            await this.mongoClient.connect();
        }
    }
    shouldConvertTinyIntegersToBooleans() {
        return false;
    }
    async deleteEntityByField(EntityClass, fieldName, fieldValue, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'deleteEntityByField');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            const lastFieldNamePart = fieldName.slice(fieldName.lastIndexOf('.') + 1);
            if (!shouldUseRandomInitializationVector_1.default(lastFieldNamePart) && shouldEncryptValue_1.default(lastFieldNamePart)) {
                fieldValue = encrypt_1.default(fieldValue, false);
            }
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            await this.tryExecute(shouldUseTransaction, async (client) => {
                if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
                    const [currentEntity, error] = await this.getEntityByField(EntityClass, fieldName, fieldValue, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true);
                    if (!currentEntity) {
                        return [null, error];
                    }
                    await tryExecuteEntityPreHooks_1.default(options === null || options === void 0 ? void 0 : options.entityPreHooks, currentEntity);
                }
                await client
                    .db(this.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .deleteOne({ [fieldName]: fieldValue });
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
                }
            });
            return [null, null];
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async removeSubEntitiesByJsonPathFromEntityByFilters(subEntitiesJsonPath, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntitiesByJsonPathFromEntityByFilters');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async () => {
                var _a;
                const [currentEntity] = await this.getEntityByFilters(EntityClass, filters, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
                if (currentEntity) {
                    await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
                    const subEntities = jsonpath_plus_1.JSONPath({ json: currentEntity, path: subEntitiesJsonPath });
                    if (subEntities.length > 0) {
                        removeSubEntities_1.default(currentEntity, subEntities);
                        await this.updateEntity(EntityClass, currentEntity, undefined);
                    }
                }
                if (options === null || options === void 0 ? void 0 : options.postHook) {
                    await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
                }
                return [null, null];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async removeSubEntityByIdFromEntityByFilters(subEntitiesJsonPath, subEntityId, EntityClass, filters, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'removeSubEntityByIdFromEntityByFilters');
        const isNonNestedColumnName = subEntitiesJsonPath.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
        let response;
        if (isNonNestedColumnName) {
            response = await removeSimpleSubEntityByIdFromEntityByFilters_1.default(this, filters, subEntitiesJsonPath, subEntityId, EntityClass, options);
        }
        else {
            const subEntityJsonPath = `${subEntitiesJsonPath}[?(@.id == '${subEntityId}' || @._id == '${subEntityId}')]`;
            response = await this.removeSubEntitiesByJsonPathFromEntityByFilters(subEntityJsonPath, EntityClass, filters, options);
        }
        recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        return response;
    }
    async addEntityArrayFieldValues(EntityClass, _id, fieldName, fieldValues, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addEntityArrayFieldValues');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                return addSimpleSubEntitiesOrValuesByEntityId_1.default(client, this, _id, fieldName, fieldValues, EntityClass, options);
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async doesEntityArrayFieldContainValue(EntityClass, _id, fieldName, fieldValue) {
        var _a, _b, _c;
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addEntityArrayFieldValues');
        EntityClass = this.getType(EntityClass);
        try {
            let isSelectForUpdate = false;
            if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = this.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = this.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
                isSelectForUpdate = true;
            }
            return await this.tryExecute(false, async (client) => {
                if (isSelectForUpdate) {
                    await client
                        .db(this.dbName)
                        .collection(EntityClass.name.toLowerCase())
                        .findOneAndUpdate({ _id: new mongodb_1.ObjectId(_id) }, { $set: { _backkLock: new mongodb_1.ObjectId() } });
                }
                const cursor = client
                    .db(this.dbName)
                    .collection(getTableName_1.default(EntityClass.name))
                    .find({ _id: new mongodb_1.ObjectId(_id), [fieldName]: fieldValue });
                const rows = await cursor.toArray();
                if (rows.length >= 1) {
                    return [true, null];
                }
                return [false, null];
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
    async removeEntityArrayFieldValues(EntityClass, _id, fieldName, fieldValues, options) {
        const dbOperationStartTimeInMillis = startDbOperation_1.default(this, 'addEntityArrayFieldValues');
        EntityClass = this.getType(EntityClass);
        let shouldUseTransaction = false;
        try {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(this);
            return await this.tryExecute(shouldUseTransaction, async (client) => {
                return removeFieldValues_1.default(client, this, _id, fieldName, fieldValues, EntityClass, options);
            });
        }
        catch (errorOrBackkError) {
            return isBackkError_1.default(errorOrBackkError)
                ? [null, errorOrBackkError]
                : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
        }
        finally {
            cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, this);
            recordDbOperationDuration_1.default(this, dbOperationStartTimeInMillis);
        }
    }
};
MongoDbManager = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [String, String])
], MongoDbManager);
exports.default = MongoDbManager;
//# sourceMappingURL=MongoDbManager.js.map