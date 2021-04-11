"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
function getRootProjection(projection, EntityClass, Types, subEntityPath = '') {
    const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    const rootProjection = Object.entries(entityPropertyNameToPropertyTypeNameMap).reduce((otherRootProjection, [propertyName, propertyTypeName]) => {
        const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
        let subEntityProjection = {};
        const fieldPathName = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;
        if (isEntityTypeName_1.default(baseTypeName) &&
            !typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, propertyName)) {
            const subEntityName = entityAnnotationContainer_1.default.entityNameToTableNameMap[baseTypeName];
            if (subEntityName) {
                const subEntityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(Types[baseTypeName]);
                const areAllSubEntityPropertiesUndefined = Object.keys(subEntityPropertyNameToPropertyTypeNameMap).reduce((areAllSubEntityPropertiesUndefined, subEntityPropertyName) => {
                    const subEntityFieldPathName = fieldPathName + '.' + subEntityPropertyName;
                    if (projection[subEntityFieldPathName] !== undefined) {
                        return false;
                    }
                    return areAllSubEntityPropertiesUndefined;
                }, true);
                if (areAllSubEntityPropertiesUndefined) {
                    Object.keys(subEntityPropertyNameToPropertyTypeNameMap).forEach((subEntityPropertyName) => {
                        const subEntityFieldPathName = fieldPathName + '.' + subEntityPropertyName;
                        if (projection[subEntityFieldPathName] === undefined) {
                            projection[subEntityFieldPathName] = 1;
                        }
                    });
                }
            }
            subEntityProjection = getRootProjection(projection, Types[baseTypeName], Types, propertyName);
        }
        const entityProjection = Object.entries(projection).reduce((entityProjection, [projectionFieldPathName, shouldIncludeField]) => {
            let newEntityProjection = entityProjection;
            if (projectionFieldPathName === fieldPathName) {
                newEntityProjection = { ...newEntityProjection, [fieldPathName]: shouldIncludeField };
            }
            else if (projectionFieldPathName.length > fieldPathName.length &&
                projectionFieldPathName.startsWith(fieldPathName)) {
                newEntityProjection = { ...newEntityProjection, [fieldPathName]: shouldIncludeField };
            }
            return newEntityProjection;
        }, {});
        return { ...otherRootProjection, ...entityProjection, ...subEntityProjection };
    }, {});
    Object.keys(rootProjection).forEach((fieldName) => {
        if (!fieldName.includes('.')) {
            const foundSubFieldName = Object.keys(rootProjection).find((otherFieldName) => otherFieldName.startsWith(fieldName + '.'));
            if (foundSubFieldName) {
                delete rootProjection[fieldName];
            }
        }
    });
    return rootProjection;
}
exports.default = getRootProjection;
//# sourceMappingURL=getRootProjection.js.map