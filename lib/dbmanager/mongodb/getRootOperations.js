"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
function getRootOperations(operations, EntityClass, Types, subEntityPath = '') {
    const entityClassPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    let rootEntityOperations = [];
    if (subEntityPath === '') {
        rootEntityOperations = operations.filter((operation) => !operation.subEntityPath || operation.subEntityPath === '*');
    }
    const otherRootOperations = Object.entries(entityClassPropertyNameToPropertyTypeNameMap).reduce((otherRootOperations, [propertyName, propertyTypeName]) => {
        const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (isEntityTypeName_1.default(baseTypeName)) {
            if (!typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, propertyName)) {
                const subSubEntityOperations = getRootOperations(operations, Types[baseTypeName], Types, propertyName + '.');
                const subEntityOperations = operations.filter((operation) => {
                    const wantedSubEntityPath = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;
                    return operation.subEntityPath === wantedSubEntityPath || operation.subEntityPath === '*';
                });
                return [...otherRootOperations, ...subEntityOperations, ...subSubEntityOperations];
            }
        }
        return otherRootOperations;
    }, []);
    return [...rootEntityOperations, ...otherRootOperations];
}
exports.default = getRootOperations;
//# sourceMappingURL=getRootOperations.js.map