"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonpath_plus_1 = require("jsonpath-plus");
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const findParentEntityAndPropertyNameForSubEntity_1 = __importDefault(require("../../../../metadata/findParentEntityAndPropertyNameForSubEntity"));
const class_validator_1 = require("class-validator");
const tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded_1 = __importDefault(require("./utils/tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const getSingularName_1 = __importDefault(require("../../../../utils/getSingularName"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
const constants_1 = require("../../../../constants/constants");
const findSubEntityClass_1 = __importDefault(require("../../../../utils/type/findSubEntityClass"));
const getEntityByFilters_1 = __importDefault(require("../dql/getEntityByFilters"));
async function addSubEntitiesByFilters(dbManager, filters, subEntityPath, newSubEntities, EntityClass, options) {
    var _a;
    EntityClass = dbManager.getType(EntityClass);
    const SubEntityClass = findSubEntityClass_1.default(subEntityPath, EntityClass, dbManager.getTypes());
    if (!SubEntityClass) {
        throw new Error('Invalid subEntityPath: ' + subEntityPath);
    }
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        let [currentEntity, error] = await getEntityByFilters_1.default(dbManager, filters, EntityClass, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
        if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.NOT_FOUND && (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundUse)) {
            [currentEntity, error] = await options.ifEntityNotFoundUse();
        }
        if (!currentEntity) {
            throw error;
        }
        await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
        await tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded_1.default(dbManager, currentEntity, EntityClass);
        const maxSubItemId = jsonpath_plus_1.JSONPath({ json: currentEntity, path: subEntityPath }).reduce((maxSubItemId, subItem) => {
            const subItemId = parseInt(subItem.id);
            return subItemId > maxSubItemId ? subItemId : maxSubItemId;
        }, -1);
        const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity_1.default(EntityClass, SubEntityClass, dbManager.getTypes());
        if (parentEntityClassAndPropertyNameForSubEntity) {
            const metadataForValidations = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(parentEntityClassAndPropertyNameForSubEntity[0], '');
            const foundArrayMaxSizeValidation = metadataForValidations.find((validationMetadata) => validationMetadata.propertyName === parentEntityClassAndPropertyNameForSubEntity[1] &&
                validationMetadata.type === 'arrayMaxSize');
            if (foundArrayMaxSizeValidation &&
                maxSubItemId + newSubEntities.length >= foundArrayMaxSizeValidation.constraints[0]) {
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
        await forEachAsyncParallel_1.default(newSubEntities, async (newSubEntity, index) => {
            var _a;
            if (parentEntityClassAndPropertyNameForSubEntity &&
                typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(parentEntityClassAndPropertyNameForSubEntity[0], parentEntityClassAndPropertyNameForSubEntity[1])) {
                const [subEntity, error] = await dbManager.getEntityById(SubEntityClass, (_a = newSubEntity._id) !== null && _a !== void 0 ? _a : '');
                if (!subEntity) {
                    throw error;
                }
                const associationTable = `${EntityClass.name}_${getSingularName_1.default(parentEntityClassAndPropertyNameForSubEntity[1])}`;
                const { entityForeignIdFieldName, subEntityForeignIdFieldName } = entityAnnotationContainer_1.default.getManyToManyRelationTableSpec(associationTable);
                await dbManager.tryExecuteSql(`INSERT INTO ${dbManager.schema.toLowerCase()}.${associationTable.toLowerCase()} (${entityForeignIdFieldName.toLowerCase()}, ${subEntityForeignIdFieldName.toLowerCase()}) VALUES (${dbManager.getValuePlaceholder(1)}, ${dbManager.getValuePlaceholder(2)})`, [currentEntity === null || currentEntity === void 0 ? void 0 : currentEntity._id, subEntity._id]);
            }
            else {
                const foreignIdFieldName = entityAnnotationContainer_1.default.getForeignIdFieldName(SubEntityClass.name);
                const [, error] = await dbManager.createEntity(SubEntityClass, {
                    ...newSubEntity,
                    [foreignIdFieldName]: currentEntity === null || currentEntity === void 0 ? void 0 : currentEntity._id,
                    id: (maxSubItemId + 1 + index).toString()
                }, undefined);
                if (error) {
                    throw error;
                }
            }
        });
        if (options === null || options === void 0 ? void 0 : options.postHook) {
            await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
        }
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
exports.default = addSubEntitiesByFilters;
//# sourceMappingURL=addSubEntitiesByFilters.js.map