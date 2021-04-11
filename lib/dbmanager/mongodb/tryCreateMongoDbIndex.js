"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
async function tryCreateMongoDbIndex(dbManager, indexName, schema, indexFields, isUnique = false) {
    const collectionName = indexName.split(':')[0].toLowerCase();
    const sortOrder = entityAnnotationContainer_1.default.indexNameToSortOrderMap[indexName];
    const sortOrders = indexFields.map((indexField) => {
        if (indexField.toUpperCase().includes(' ASC')) {
            return 1;
        }
        else if (indexField.toUpperCase().includes(' DESC')) {
            return -1;
        }
        return 1;
    });
    await dbManager.tryReserveDbConnectionFromPool();
    await dbManager.tryExecute(false, async (client) => {
        await client
            .db(dbManager.dbName)
            .createIndex(collectionName, indexFields.reduce((indexFieldsSpec, indexField, index) => ({
            ...indexFieldsSpec,
            [indexField]: indexFields.length === 1 ? (sortOrder === 'ASC' ? 1 : -1) : sortOrders[index]
        }), {}), {
            unique: isUnique
        });
    });
}
exports.default = tryCreateMongoDbIndex;
//# sourceMappingURL=tryCreateMongoDbIndex.js.map