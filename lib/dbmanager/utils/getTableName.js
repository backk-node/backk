"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntityName = void 0;
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
function getTableName(entityName) {
    if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
        return entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName].toLowerCase();
    }
    return entityName.toLowerCase();
}
exports.default = getTableName;
function getEntityName(entityName) {
    if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
        return entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName];
    }
    return entityName;
}
exports.getEntityName = getEntityName;
//# sourceMappingURL=getTableName.js.map