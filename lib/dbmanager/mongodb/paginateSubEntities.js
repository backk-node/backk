"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const jsonpath_plus_1 = require("jsonpath-plus");
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
function paginateRows(rows, pagination, subEntityJsonPath, propertyName) {
    rows.forEach((row) => {
        const [subEntitiesParent] = jsonpath_plus_1.JSONPath({ json: row, path: subEntityJsonPath + propertyName + '^' });
        if (subEntitiesParent &&
            Array.isArray(subEntitiesParent[propertyName]) &&
            (pagination.pageNumber !== 1 ||
                (pagination.pageNumber === 1 &&
                    subEntitiesParent.length > pagination.pageNumber * pagination.pageSize))) {
            subEntitiesParent[propertyName] = subEntitiesParent[propertyName].slice((pagination.pageNumber - 1) * pagination.pageSize, pagination.pageNumber * pagination.pageSize);
        }
    });
}
function paginateSubEntities(rows, paginations, EntityClass, Types, subEntityPath = '', subEntityJsonPath = '$.') {
    const entityClassPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityClassPropertyNameToPropertyTypeNameMap).forEach(([propertyName, propertyTypeName]) => {
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (isEntityTypeName_1.default(baseTypeName) &&
            isArrayType &&
            !typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, propertyName)) {
            let pagination = paginations === null || paginations === void 0 ? void 0 : paginations.find((pagination) => {
                const wantedSubEntityPath = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;
                return pagination.subEntityPath === wantedSubEntityPath;
            });
            if (!pagination) {
                pagination = paginations === null || paginations === void 0 ? void 0 : paginations.find((pagination) => pagination.subEntityPath === '*');
            }
            if (pagination) {
                paginateRows(rows, pagination, subEntityJsonPath, propertyName);
            }
            paginateSubEntities(rows, paginations, Types[baseTypeName], Types, subEntityPath + propertyName + '.', subEntityJsonPath + propertyName + '[*].');
        }
    });
}
exports.default = paginateSubEntities;
//# sourceMappingURL=paginateSubEntities.js.map