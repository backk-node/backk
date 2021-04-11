"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncSequential_1 = __importDefault(require("../../utils/forEachAsyncSequential"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
async function tryCreateMongoDbIndexesForUniqueFields(dbManager, EntityClass) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    await forEachAsyncSequential_1.default(Object.keys(entityMetadata), async (fieldName) => {
        if (typePropertyAnnotationContainer_1.default.isTypePropertyUnique(EntityClass, fieldName)) {
            await dbManager.tryReserveDbConnectionFromPool();
            await dbManager.tryExecute(false, async (client) => {
                await client.db(dbManager.dbName).createIndex(EntityClass.name.toLowerCase(), { [fieldName]: 1 }, {
                    unique: true
                });
            });
        }
    });
}
exports.default = tryCreateMongoDbIndexesForUniqueFields;
//# sourceMappingURL=tryCreateMongoDbIndexesForUniqueFields.js.map