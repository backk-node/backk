"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryAlterTable_1 = __importDefault(require("./tryAlterTable"));
const tryCreateTable_1 = __importDefault(require("./tryCreateTable"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
async function tryAlterOrCreateTable(dbManager, entityName, EntityClass, schema) {
    let fields;
    let isPhysicalTable = true;
    try {
        let tableName = entityName.toLowerCase();
        if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
            tableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName].toLowerCase();
            isPhysicalTable = false;
        }
        fields = await dbManager.tryExecuteSqlWithoutCls(`SELECT * FROM ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${tableName} LIMIT 1`, undefined, false);
    }
    catch (error) {
        await tryCreateTable_1.default(dbManager, entityName, EntityClass, schema, isPhysicalTable);
        return;
    }
    await tryAlterTable_1.default(dbManager, entityName, EntityClass, schema, fields);
}
exports.default = tryAlterOrCreateTable;
//# sourceMappingURL=tryAlterOrCreateTable.js.map