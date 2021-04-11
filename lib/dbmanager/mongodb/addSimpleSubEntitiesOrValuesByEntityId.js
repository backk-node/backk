"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryExecuteEntityPreHooks_1 = __importDefault(require("../hooks/tryExecuteEntityPreHooks"));
const mongodb_1 = require("mongodb");
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const constants_1 = require("../../constants/constants");
const tryExecutePostHook_1 = __importDefault(require("../hooks/tryExecutePostHook"));
async function addSimpleSubEntitiesOrValuesByEntityId(client, dbManager, _id, subEntityPath, newSubEntities, EntityClass, options) {
    var _a;
    if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
        let [currentEntity, error] = await dbManager.getEntityById(EntityClass, _id, {
            postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations
        });
        if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.NOT_FOUND && (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundUse)) {
            [currentEntity, error] = await options.ifEntityNotFoundUse();
        }
        if (!currentEntity) {
            return [null, error];
        }
        await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
    }
    if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, subEntityPath)) {
        newSubEntities = newSubEntities.map((subEntity) => subEntity._id);
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
        .updateOne({ _id: new mongodb_1.ObjectId(_id) }, {
        ...versionUpdate,
        ...lastModifiedTimestampUpdate,
        $push: { [subEntityPath]: { $each: newSubEntities } }
    });
    if (options === null || options === void 0 ? void 0 : options.postHook) {
        await tryExecutePostHook_1.default(options.postHook, null);
    }
    return [null, null];
}
exports.default = addSimpleSubEntitiesOrValuesByEntityId;
//# sourceMappingURL=addSimpleSubEntitiesOrValuesByEntityId.js.map