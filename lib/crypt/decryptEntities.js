"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decrypt_1 = __importDefault(require("./decrypt"));
const shouldEncryptValue_1 = __importDefault(require("./shouldEncryptValue"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
function decryptEntityValues(entity, EntityClass, Types, shouldDecryptManyToMany = true) {
    if (entity === null) {
        return;
    }
    Object.entries(entity).forEach(([propertyName, propertyValue]) => {
        if (Array.isArray(propertyValue) && propertyValue.length > 0) {
            if (typeof propertyValue[0] === 'object' && propertyValue[0] !== null) {
                const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
                const isManyToMany = typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, propertyName);
                if ((!isManyToMany || isManyToMany && shouldDecryptManyToMany) && entityMetadata[propertyName]) {
                    propertyValue.forEach((pv) => {
                        decryptEntityValues(pv, Types[getTypeInfoForTypeName_1.default(entityMetadata[propertyName]).baseTypeName], Types, shouldDecryptManyToMany);
                    });
                }
            }
            else if (shouldEncryptValue_1.default(propertyName, EntityClass)) {
                if (typeof propertyValue[0] !== 'string') {
                    throw new Error(EntityClass.name + '.' + propertyName + ' must be string array in order to encrypt it');
                }
                propertyValue.forEach((_, index) => {
                    propertyValue[index] = decrypt_1.default(propertyValue[index]);
                });
            }
        }
        else if (propertyName !== '_id' && typeof propertyValue === 'object' && propertyValue !== null) {
            const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
            if (entityMetadata[propertyName]) {
                decryptEntityValues(propertyValue, Types[getTypeInfoForTypeName_1.default(entityMetadata[propertyName]).baseTypeName], Types, shouldDecryptManyToMany);
            }
        }
        else if (propertyValue !== null &&
            propertyValue !== undefined &&
            shouldEncryptValue_1.default(propertyName, EntityClass)) {
            if (typeof propertyValue !== 'string') {
                throw new Error(EntityClass.name + '.' + propertyName + ' must be string in order to encrypt it');
            }
            entity[propertyName] = decrypt_1.default(propertyValue);
        }
    });
}
function decryptEntities(entities, EntityClass, Types, shouldDecryptManyToMany = true) {
    entities.forEach((entity) => decryptEntityValues(entity, EntityClass, Types, shouldDecryptManyToMany));
}
exports.default = decryptEntities;
//# sourceMappingURL=decryptEntities.js.map