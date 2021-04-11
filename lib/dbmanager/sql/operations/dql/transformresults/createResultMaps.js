"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shouldIncludeField_1 = __importDefault(require("../utils/columns/shouldIncludeField"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../../utils/type/isEntityTypeName"));
function updateResultMaps(entityClassOrName, Types, resultMaps, projection, fieldPath, isInternalCall, suppliedEntityMetadata = {}, ParentEntityClass, tablePath) {
    let entityMetadata = typeof entityClassOrName === 'function'
        ? getClassPropertyNameToPropertyTypeNameMap_1.default(entityClassOrName)
        : suppliedEntityMetadata;
    const entityName = typeof entityClassOrName === 'function' ? entityClassOrName.name : entityClassOrName;
    if (!tablePath) {
        tablePath = entityName.toLowerCase();
    }
    let idFieldName = 'id';
    if (entityMetadata._id) {
        idFieldName = '_id';
    }
    const resultMap = {
        mapId: entityName + 'Map',
        idProperty: idFieldName,
        properties: [],
        collections: [],
        associations: []
    };
    if (isInternalCall) {
        entityMetadata = {
            ...entityMetadata,
            '_id': 'string'
        };
    }
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        if (isArrayType && isEntityTypeName_1.default(baseTypeName)) {
            if (shouldIncludeField_1.default(fieldName, fieldPath, projection)) {
                const relationEntityName = baseTypeName;
                resultMap.collections.push({
                    name: fieldName,
                    mapId: relationEntityName + 'Map',
                    columnPrefix: tablePath + '_' + fieldName.toLowerCase() + '_'
                });
                updateResultMaps(Types[relationEntityName], Types, resultMaps, projection, fieldPath + fieldName + '.', isInternalCall, {}, entityClassOrName, tablePath + '_' + fieldName.toLowerCase());
            }
        }
        else if (isEntityTypeName_1.default(baseTypeName)) {
            if (shouldIncludeField_1.default(fieldName, fieldPath, projection)) {
                const relationEntityName = baseTypeName;
                resultMap.associations.push({
                    name: fieldName,
                    mapId: relationEntityName + 'Map',
                    columnPrefix: tablePath + '_' + fieldName.toLowerCase() + '_'
                });
                updateResultMaps(Types[relationEntityName], Types, resultMaps, projection, fieldPath + fieldName + '.', isInternalCall, {}, entityClassOrName, tablePath + '_' + fieldName.toLowerCase());
            }
        }
        else if (isArrayType) {
            if (shouldIncludeField_1.default(fieldName, fieldPath, projection)) {
                const relationEntityName = tablePath + '_' + fieldName.toLowerCase();
                resultMap.collections.push({
                    name: fieldName,
                    mapId: relationEntityName + 'Map',
                    columnPrefix: relationEntityName + '_'
                });
                updateResultMaps(relationEntityName, Types, resultMaps, projection, fieldPath + fieldName + '.', isInternalCall, {
                    id: 'integer',
                    [fieldName.slice(0, -1)]: 'integer'
                }, entityClassOrName, tablePath + '_' + fieldName.toLowerCase());
            }
        }
        else if (((!ParentEntityClass && fieldName !== '_id') || (ParentEntityClass && fieldName !== 'id')) &&
            shouldIncludeField_1.default(fieldName, fieldPath, projection)) {
            resultMap.properties.push({ name: fieldName, column: fieldName.toLowerCase() });
        }
    });
    resultMaps.push(resultMap);
}
function createResultMaps(entityClass, Types, projection, isInternalCall) {
    const resultMaps = [];
    updateResultMaps(entityClass, Types, resultMaps, projection, '', isInternalCall);
    return resultMaps;
}
exports.default = createResultMaps;
//# sourceMappingURL=createResultMaps.js.map