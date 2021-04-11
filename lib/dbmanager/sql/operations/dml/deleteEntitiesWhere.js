"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const shouldUseRandomInitializationVector_1 = __importDefault(require("../../../../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../../../../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../../../../crypt/encrypt"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
async function deleteEntitiesWhere(dbManager, fieldName, fieldValue, EntityClass) {
    if (fieldName.includes('.')) {
        throw new Error('fieldName parameter may not contain dots, i.e. it cannot be a field path name');
    }
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
            fieldValue = encrypt_1.default(fieldValue, false);
        }
        await Promise.all([
            forEachAsyncParallel_1.default(Object.values(entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name] || {}), async (joinSpec) => {
                if (!joinSpec.isReadonly) {
                    await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()} WHERE ${joinSpec.subEntityForeignIdFieldName.toLowerCase()} IN (SELECT _id FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} WHERE ${fieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)})`, [fieldValue]);
                }
            }),
            forEachAsyncParallel_1.default(entityAnnotationContainer_1.default.manyToManyRelationTableSpecs, async ({ associationTableName, entityForeignIdFieldName }) => {
                if (associationTableName.startsWith(EntityClass.name + '_')) {
                    await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} IN (SELECT _id FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} WHERE ${fieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)})`, [fieldValue]);
                }
            }),
            dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} WHERE ${fieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)}`, [fieldValue])
        ]);
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, null];
    }
    catch (errorOrBackkError) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = deleteEntitiesWhere;
//# sourceMappingURL=deleteEntitiesWhere.js.map