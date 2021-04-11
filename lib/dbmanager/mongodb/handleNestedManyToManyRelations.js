"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
function handleNestedManyToManyRelations(entity, Types, EntityClass, subEntityPath) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        var _a;
        if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
            delete entity[fieldName];
        }
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        const fieldPathName = subEntityPath + '.' + fieldName;
        if (isArrayType &&
            isEntityTypeName_1.default(baseTypeName) &&
            typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
            const subEntityValue = lodash_1.default.get(entity, subEntityPath);
            if (Array.isArray(subEntityValue)) {
                subEntityValue.forEach((subEntity, index) => {
                    const fieldPathName = subEntityPath + '[' + index + ']' + '.' + fieldName;
                    if (lodash_1.default.get(entity, fieldPathName) !== undefined) {
                        lodash_1.default.set(entity, fieldPathName, lodash_1.default.get(entity, fieldPathName).map((subEntity) => subEntity._id));
                    }
                });
            }
            else {
                lodash_1.default.set(entity, fieldPathName, ((_a = lodash_1.default.get(entity, fieldPathName)) !== null && _a !== void 0 ? _a : []).map((subEntity) => subEntity._id));
            }
        }
        else if (isEntityTypeName_1.default(baseTypeName)) {
            handleNestedManyToManyRelations(entity, Types, Types[baseTypeName], fieldPathName);
        }
    });
}
exports.default = handleNestedManyToManyRelations;
//# sourceMappingURL=handleNestedManyToManyRelations.js.map