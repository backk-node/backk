"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMaxLengthValidationConstraint_1 = __importDefault(require("../../../../../validation/getMaxLengthValidationConstraint"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
function getSqlColumnType(dbManager, EntityClass, fieldName, baseFieldTypeName) {
    switch (baseFieldTypeName) {
        case 'integer':
            return 'INTEGER';
        case 'bigint':
            return 'BIGINT';
        case 'number':
            return 'DOUBLE PRECISION';
        case 'boolean':
            return 'BOOLEAN';
        case 'Date':
            return dbManager.getTimestampType();
        case 'string':
            if ((fieldName.endsWith('Id') || fieldName === 'id') &&
                !typePropertyAnnotationContainer_1.default.isTypePropertyExternalId(EntityClass, fieldName)) {
                return 'BIGINT';
            }
            else {
                const maxLength = getMaxLengthValidationConstraint_1.default(EntityClass, fieldName);
                return dbManager.getVarCharType(maxLength);
            }
    }
    return undefined;
}
exports.default = getSqlColumnType;
//# sourceMappingURL=getSqlColumnType.js.map