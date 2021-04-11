"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../../utils/type/isEntityTypeName"));
function convertTinyIntegersToBooleansInRow(result, EntityClass, Types) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        if (result[fieldName] !== null && result[fieldName] !== undefined) {
            if (isArrayType && isEntityTypeName_1.default(baseTypeName)) {
                result[fieldName].forEach((subResult) => convertTinyIntegersToBooleansInRow(subResult, Types[baseTypeName], Types));
            }
            else if (isEntityTypeName_1.default(baseTypeName)) {
                convertTinyIntegersToBooleansInRow(result[fieldName], Types[baseTypeName], Types);
            }
            else if (baseTypeName === 'boolean' && isArrayType) {
                result[fieldName] = result[fieldName].map((value) => {
                    if (value === 0) {
                        return false;
                    }
                    else if (value === 1) {
                        return true;
                    }
                    return value;
                });
            }
            else if (baseTypeName === 'boolean') {
                if (result[fieldName] === 0) {
                    result[fieldName] = false;
                }
                else if (result[fieldName] === 1) {
                    result[fieldName] = true;
                }
            }
        }
    });
}
function convertTinyIntegersToBooleans(results, entityClass, Types) {
    results.forEach((result) => convertTinyIntegersToBooleansInRow(result, entityClass, Types));
}
exports.default = convertTinyIntegersToBooleans;
//# sourceMappingURL=convertTinyIntegersToBooleans.js.map