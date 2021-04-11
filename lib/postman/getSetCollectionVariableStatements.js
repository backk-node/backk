"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
function getSetCollectionVariableStatements(entityName, typeName, serviceMetadata, types, responsePath) {
    if (typeName === 'null') {
        return [];
    }
    const typeMetadata = serviceMetadata.types[typeName];
    let collectionVariableSetStatements = [];
    Object.entries(typeMetadata).forEach(([propertyName, propertyTypeName]) => {
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (propertyName === '_id') {
            collectionVariableSetStatements.push('try {');
            collectionVariableSetStatements.push(`  pm.collectionVariables.set("${entityName}Id", response${responsePath}_id)`);
            collectionVariableSetStatements.push('} catch(error) {\n}');
        }
        else if (propertyName === 'id') {
            collectionVariableSetStatements.push('try {');
            collectionVariableSetStatements.push(`  pm.collectionVariables.set("${entityName}Id", response${responsePath}id)`);
            collectionVariableSetStatements.push('} catch(error) {\n}');
        }
        if (types[baseTypeName]) {
            const finalResponsePath = responsePath + propertyName + (isArrayType ? '[0]' : '') + '.';
            collectionVariableSetStatements = collectionVariableSetStatements.concat(getSetCollectionVariableStatements(baseTypeName.charAt(0).toLowerCase() + baseTypeName.slice(1), baseTypeName, serviceMetadata, types, finalResponsePath));
        }
    });
    return collectionVariableSetStatements;
}
exports.default = getSetCollectionVariableStatements;
//# sourceMappingURL=getSetCollectionVariableStatements.js.map