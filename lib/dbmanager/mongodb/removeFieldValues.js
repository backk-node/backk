"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryExecuteEntityPreHooks_1 = __importDefault(require("../hooks/tryExecuteEntityPreHooks"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../sql/operations/transaction/tryStartLocalTransactionIfNeeded"));
const tryExecutePostHook_1 = __importDefault(require("../hooks/tryExecutePostHook"));
const isBackkError_1 = __importDefault(require("../../errors/isBackkError"));
const createBackkErrorFromError_1 = __importDefault(require("../../errors/createBackkErrorFromError"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../sql/operations/transaction/cleanupLocalTransactionIfNeeded"));
const mongodb_1 = require("mongodb");
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
async function removeFieldValues(client, dbManager, _id, fieldName, fieldValues, EntityClass, options) {
    EntityClass = dbManager.getType(EntityClass);
    let shouldUseTransaction = false;
    try {
        shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        return await dbManager.tryExecute(shouldUseTransaction, async (client) => {
            var _a;
            if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
                const [currentEntity, error] = await dbManager.getEntityById(EntityClass, _id, undefined);
                if (!currentEntity) {
                    throw error;
                }
                await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
            }
            const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
            let versionUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.version) {
                versionUpdate = { $inc: { version: 1 } };
            }
            let lastModifiedTimestampUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
                lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
            }
            await client
                .db(dbManager.dbName)
                .collection(EntityClass.name.toLowerCase())
                .updateOne({ _id: new mongodb_1.ObjectId(_id) }, { ...versionUpdate, ...lastModifiedTimestampUpdate, $pull: { [fieldName]: { $in: fieldValues } } });
            if (options === null || options === void 0 ? void 0 : options.postHook) {
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
        cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, dbManager);
    }
}
exports.default = removeFieldValues;
//# sourceMappingURL=removeFieldValues.js.map