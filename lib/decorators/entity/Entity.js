"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("./entityAnnotationContainer"));
const types_1 = __importDefault(require("../../types/types"));
function Entity(referenceToEntity, additionalSqlCreateTableStatementOptions) {
    return function (EntityClass) {
        const foundInternalEntityClass = Object.values(types_1.default).find((type) => type === EntityClass);
        if (!foundInternalEntityClass &&
            !EntityClass.name.startsWith('__Backk') &&
            !EntityClass.name.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
            throw new Error(EntityClass.name + ': entity class name must match regular expression: /^[a-zA-Z][a-zA-Z0-9]*$/');
        }
        entityAnnotationContainer_1.default.addEntityNameAndClass(EntityClass.name, EntityClass);
        if (referenceToEntity) {
            entityAnnotationContainer_1.default.addEntityTableName(EntityClass.name, referenceToEntity);
        }
        if (additionalSqlCreateTableStatementOptions) {
            entityAnnotationContainer_1.default.addAdditionalSqlCreateTableStatementOptionsForEntity(EntityClass.name, additionalSqlCreateTableStatementOptions);
        }
    };
}
exports.default = Entity;
//# sourceMappingURL=Entity.js.map