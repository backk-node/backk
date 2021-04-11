"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../../utils/type/isEntityTypeName"));
function transformNonEntityArray(result, EntityClass, Types) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        if (result[fieldName]) {
            if (isArrayType && isEntityTypeName_1.default(baseTypeName)) {
                result[fieldName].forEach((subResult) => transformNonEntityArray(subResult, Types[baseTypeName], Types));
            }
            else if (isEntityTypeName_1.default(baseTypeName)) {
                transformNonEntityArray(result[fieldName], Types[baseTypeName], Types);
            }
            else if (isArrayType) {
                const singularFieldName = fieldName.slice(0, -1);
                result[fieldName] = result[fieldName].map((obj) => obj[singularFieldName]);
            }
        }
    });
}
function transformNonEntityArrays(results, entityClass, Types) {
    results.forEach((result) => transformNonEntityArray(result, entityClass, Types));
}
exports.default = transformNonEntityArrays;
//# sourceMappingURL=transformNonEntityArrays.js.map