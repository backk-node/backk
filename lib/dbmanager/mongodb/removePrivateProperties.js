"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
function removeEntityPrivateProperties(entity, EntityClass, Types, isInternalCall) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entity).forEach(([propertyName, propertyValue]) => {
        if ((!isInternalCall && typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(EntityClass, propertyName)) ||
            propertyName === 'entityIdFieldNameAsString') {
            delete entity[propertyName];
            return;
        }
        if (entityMetadata[propertyName]) {
            const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(entityMetadata[propertyName]);
            const SubEntityClass = Types[baseTypeName];
            if (SubEntityClass && propertyValue !== null) {
                if (isArrayType) {
                    propertyValue.forEach((subValue) => {
                        removeEntityPrivateProperties(subValue, SubEntityClass, Types, isInternalCall);
                    });
                }
                else {
                    removeEntityPrivateProperties(propertyValue, SubEntityClass, Types, isInternalCall);
                }
            }
        }
    });
}
function removePrivateProperties(entities, EntityClass, Types, isInternalCall = false) {
    entities.forEach((entity) => {
        removeEntityPrivateProperties(entity, EntityClass, Types, isInternalCall);
    });
}
exports.default = removePrivateProperties;
//# sourceMappingURL=removePrivateProperties.js.map