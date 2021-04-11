"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const encrypt_1 = __importDefault(require("./encrypt"));
const hash_1 = __importDefault(require("./hash"));
const shouldEncryptValue_1 = __importDefault(require("./shouldEncryptValue"));
const shouldHashValue_1 = __importDefault(require("./shouldHashValue"));
const shouldUseRandomInitializationVector_1 = __importDefault(require("./shouldUseRandomInitializationVector"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const mongodb_1 = require("mongodb");
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
async function hashOrEncryptEntityValues(entity, EntityClass, Types) {
    await forEachAsyncParallel_1.default(Object.entries(entity), async ([propertyName, propertyValue]) => {
        if (Array.isArray(propertyValue) && propertyValue.length > 0) {
            if (typeof propertyValue[0] === 'object' && propertyValue[0] !== null) {
                const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
                await forEachAsyncParallel_1.default(propertyValue, async (pv) => {
                    await hashOrEncryptEntityValues(pv, Types[getTypeInfoForTypeName_1.default(entityMetadata[propertyName]).baseTypeName], Types);
                });
            }
            else if (shouldHashValue_1.default(propertyName, EntityClass)) {
                await forEachAsyncParallel_1.default(propertyValue, async (_, index) => {
                    if (propertyValue[index] !== null) {
                        if (typeof propertyValue[index] !== 'string') {
                            throw new Error(EntityClass.name + '.' + propertyName + ' must be string array in order to hash it');
                        }
                        propertyValue[index] = await hash_1.default(propertyValue[index]);
                    }
                });
            }
            else if (shouldEncryptValue_1.default(propertyName, EntityClass)) {
                await forEachAsyncParallel_1.default(propertyValue, async (_, index) => {
                    if (propertyValue[index] !== null) {
                        if (typeof propertyValue[index] !== 'string') {
                            throw new Error(EntityClass.name + '.' + propertyName + ' must be string array in order to encrypt it');
                        }
                        propertyValue[index] = encrypt_1.default(propertyValue[index]);
                    }
                });
            }
        }
        else if (typeof propertyValue === 'object' &&
            !(propertyValue instanceof mongodb_1.ObjectId) &&
            propertyValue !== null) {
            const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
            await hashOrEncryptEntityValues(propertyValue, Types[getTypeInfoForTypeName_1.default(entityMetadata[propertyName]).baseTypeName], Types);
        }
        else if (propertyValue !== null &&
            !(propertyValue instanceof mongodb_1.ObjectId) &&
            shouldHashValue_1.default(propertyName, EntityClass)) {
            if (typeof propertyValue !== 'string') {
                throw new Error(EntityClass.name + '.' + propertyName + ' must be string in order to hash it');
            }
            entity[propertyName] = await hash_1.default(propertyValue);
        }
        else if (propertyValue !== null && shouldEncryptValue_1.default(propertyName, EntityClass)) {
            if (typeof propertyValue !== 'string') {
                throw new Error(EntityClass.name + '.' + propertyName + ' must be string in order to encrypt it');
            }
            entity[propertyName] = encrypt_1.default(propertyValue, shouldUseRandomInitializationVector_1.default(propertyName));
        }
    });
}
async function hashAndEncryptEntity(entity, EntityClass, Types) {
    await hashOrEncryptEntityValues(entity, EntityClass, Types);
}
exports.default = hashAndEncryptEntity;
//# sourceMappingURL=hashAndEncryptEntity.js.map