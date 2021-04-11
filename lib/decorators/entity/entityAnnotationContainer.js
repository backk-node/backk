"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityAnnotationContainer {
    constructor() {
        this.entityNameToClassMap = {};
        this.entityNameToAdditionalSqlCreateTableStatementOptionsMap = {};
        this.entityNameToForeignIdFieldNamesMap = {};
        this.indexNameToIndexFieldsMap = {};
        this.indexNameToUniqueIndexFieldsMap = {};
        this.indexNameToSortOrderMap = {};
        this.indexNameToUsingOptionMap = {};
        this.indexNameToAdditionalSqlCreateIndexStatementOptionsMap = {};
        this.manyToManyRelationTableSpecs = [];
        this.entityNameToJoinsMap = {};
        this.entityNameToIsArrayMap = {};
        this.entityNameToTableNameMap = {};
    }
    getForeignIdFieldName(entityName) {
        return this.entityNameToForeignIdFieldNamesMap[entityName][0];
    }
    getManyToManyRelationTableSpec(associationTableName) {
        return this.manyToManyRelationTableSpecs.find((manyToManyRelationTableSpec) => manyToManyRelationTableSpec.associationTableName === associationTableName);
    }
    addEntityNameAndClass(entityName, entityClass) {
        this.entityNameToClassMap[entityName] = entityClass;
    }
    addAdditionalSqlCreateTableStatementOptionsForEntity(entityName, additionalSqlCreateTableStatementOptions) {
        this.entityNameToAdditionalSqlCreateTableStatementOptionsMap[entityName] = additionalSqlCreateTableStatementOptions;
    }
    addEntityIndex(indexName, indexFields) {
        this.indexNameToIndexFieldsMap[indexName] = indexFields;
    }
    addEntityUniqueIndex(indexName, indexFields) {
        this.indexNameToUniqueIndexFieldsMap[indexName] = indexFields;
    }
    addIndexSortOrder(indexName, sortOrder) {
        this.indexNameToSortOrderMap[indexName] = sortOrder;
    }
    addUsingOptionForIndex(indexName, usingOption) {
        this.indexNameToUsingOptionMap[indexName] = usingOption;
    }
    addAdditionalSqlCreateIndexStatementOptionsForIndex(indexName, additionalSqlCreateIndexStatementOptions) {
        this.indexNameToAdditionalSqlCreateIndexStatementOptionsMap[indexName] = additionalSqlCreateIndexStatementOptions;
    }
    addEntityAdditionalPropertyName(entityName, propertyName) {
        if (this.entityNameToForeignIdFieldNamesMap[entityName]) {
            this.entityNameToForeignIdFieldNamesMap[entityName].push(propertyName);
        }
        else {
            this.entityNameToForeignIdFieldNamesMap[entityName] = [propertyName];
        }
    }
    addEntityTableName(entityName, tableName) {
        this.entityNameToTableNameMap[entityName] = tableName;
    }
    isEntity(Class) {
        let proto = Object.getPrototypeOf(new Class());
        while (proto !== Object.prototype) {
            if (this.entityNameToClassMap[proto.constructor.name] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
}
exports.default = new EntityAnnotationContainer();
//# sourceMappingURL=entityAnnotationContainer.js.map