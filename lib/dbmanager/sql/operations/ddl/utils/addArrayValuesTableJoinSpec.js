"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../../../../decorators/entity/entityAnnotationContainer"));
function addArrayValuesTableJoinSpec(entityName, fieldName, subEntityForeignIdFieldName) {
    let tableName = entityName;
    if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
        tableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName];
    }
    const entityJoinSpec = {
        entityFieldName: fieldName,
        subEntityTableName: (tableName + '_' + fieldName.slice(0, -1)).toLowerCase(),
        entityIdFieldName: '_id',
        subEntityForeignIdFieldName,
        isReadonly: false
    };
    if (entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName]) {
        entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName].push(entityJoinSpec);
    }
    else {
        entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName] = [entityJoinSpec];
    }
}
exports.default = addArrayValuesTableJoinSpec;
//# sourceMappingURL=addArrayValuesTableJoinSpec.js.map