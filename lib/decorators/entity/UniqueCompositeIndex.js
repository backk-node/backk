"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("./entityAnnotationContainer"));
function UniqueCompositeIndex(indexFields, usingOption, additionalSqlCreateIndexStatementOptions) {
    return function (entityClass) {
        entityAnnotationContainer_1.default.addEntityUniqueIndex(entityClass.name + ':' + indexFields.join('_'), indexFields);
        entityAnnotationContainer_1.default.addUsingOptionForIndex(entityClass.name + ':' + indexFields.join('_'), usingOption);
        entityAnnotationContainer_1.default.addAdditionalSqlCreateIndexStatementOptionsForIndex(entityClass.name + ':' + indexFields.join('_'), additionalSqlCreateIndexStatementOptions);
    };
}
exports.default = UniqueCompositeIndex;
//# sourceMappingURL=UniqueCompositeIndex.js.map