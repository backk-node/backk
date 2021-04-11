"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const forEachAsyncSequential_1 = __importDefault(require("../../../../utils/forEachAsyncSequential"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../utils/type/isEntityTypeName"));
async function deleteAllEntities(dbManager, EntityClass, isRecursive = false) {
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        const Types = dbManager.getTypes();
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
        await forEachAsyncSequential_1.default(Object.entries(entityMetadata), async ([, fieldTypeName]) => {
            const { baseTypeName } = getTypeInfoForTypeName_1.default(fieldTypeName);
            if (isEntityTypeName_1.default(baseTypeName)) {
                await deleteAllEntities(dbManager, Types[baseTypeName], true);
            }
        });
        await Promise.all([
            forEachAsyncParallel_1.default(Object.values(entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name] || {}), async (joinSpec) => {
                if (!joinSpec.isReadonly) {
                    await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()}`);
                }
            }),
            forEachAsyncParallel_1.default(entityAnnotationContainer_1.default.manyToManyRelationTableSpecs, async ({ associationTableName }) => {
                if (associationTableName.startsWith(EntityClass.name + '_')) {
                    await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()}`);
                }
            }),
            isRecursive ? Promise.resolve(undefined) : dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()}`)
        ]);
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, null];
    }
    catch (error) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, createBackkErrorFromError_1.default(error)];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = deleteAllEntities;
//# sourceMappingURL=deleteAllEntities.js.map