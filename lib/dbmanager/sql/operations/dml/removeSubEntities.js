"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonpath_plus_1 = require("jsonpath-plus");
const class_transformer_1 = require("class-transformer");
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const getEntityById_1 = __importDefault(require("../dql/getEntityById"));
const deleteEntityById_1 = __importDefault(require("./deleteEntityById"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded_1 = __importDefault(require("./utils/tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const findParentEntityAndPropertyNameForSubEntity_1 = __importDefault(require("../../../../metadata/findParentEntityAndPropertyNameForSubEntity"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const getSingularName_1 = __importDefault(require("../../../../utils/getSingularName"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
async function removeSubEntities(dbManager, _id, subEntitiesJsonPath, EntityClass, entityPreHooks, postHook, postQueryOperations) {
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        const [currentEntity, error] = await getEntityById_1.default(dbManager, _id, EntityClass, { postQueryOperations }, true, true);
        if (!currentEntity) {
            throw error;
        }
        await tryExecuteEntityPreHooks_1.default(entityPreHooks !== null && entityPreHooks !== void 0 ? entityPreHooks : [], currentEntity);
        await tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded_1.default(dbManager, currentEntity, EntityClass);
        const currentEntityInstance = class_transformer_1.plainToClass(EntityClass, currentEntity);
        const subEntities = jsonpath_plus_1.JSONPath({ json: currentEntityInstance, path: subEntitiesJsonPath });
        await forEachAsyncParallel_1.default(subEntities, async (subEntity) => {
            const parentEntityClassAndPropertyNameForSubEntity = findParentEntityAndPropertyNameForSubEntity_1.default(EntityClass, subEntity.constructor, dbManager.getTypes());
            if (parentEntityClassAndPropertyNameForSubEntity &&
                typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(parentEntityClassAndPropertyNameForSubEntity[0], parentEntityClassAndPropertyNameForSubEntity[1])) {
                const associationTableName = `${EntityClass.name}_${getSingularName_1.default(parentEntityClassAndPropertyNameForSubEntity[1])}`;
                const { entityForeignIdFieldName, subEntityForeignIdFieldName } = entityAnnotationContainer_1.default.getManyToManyRelationTableSpec(associationTableName);
                const numericId = parseInt(_id, 10);
                await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)} AND ${subEntityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(2)}`, [numericId, subEntity._id]);
            }
            else {
                const [, error] = await deleteEntityById_1.default(dbManager, subEntity._id, subEntity.constructor);
                if (error) {
                    throw error;
                }
            }
        });
        if (postHook) {
            await tryExecutePostHook_1.default(postHook, null);
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
exports.default = removeSubEntities;
//# sourceMappingURL=removeSubEntities.js.map