import { SortOrder } from "../typeproperty";
export interface ManyToManyRelationTableSpec {
    entityName: string;
    entityFieldName: string;
    associationTableName: string;
    subEntityName: string;
    entityForeignIdFieldName: string;
    subEntityForeignIdFieldName: string;
}
export interface EntityJoinSpec {
    entityFieldName: string;
    subEntityTableName: string;
    entityIdFieldName: string;
    subEntityForeignIdFieldName: string;
    isReadonly: boolean;
    asFieldName?: string;
    EntityClass?: Function;
}
declare class EntityAnnotationContainer {
    readonly entityNameToClassMap: {
        [key: string]: Function;
    };
    readonly entityNameToAdditionalSqlCreateTableStatementOptionsMap: {
        [key: string]: string;
    };
    readonly entityNameToForeignIdFieldNamesMap: {
        [key: string]: string[];
    };
    readonly indexNameToIndexFieldsMap: {
        [key: string]: string[];
    };
    readonly indexNameToUniqueIndexFieldsMap: {
        [key: string]: string[];
    };
    readonly indexNameToSortOrderMap: {
        [key: string]: SortOrder;
    };
    readonly indexNameToUsingOptionMap: {
        [key: string]: string | undefined;
    };
    readonly indexNameToAdditionalSqlCreateIndexStatementOptionsMap: {
        [key: string]: string | undefined;
    };
    readonly manyToManyRelationTableSpecs: ManyToManyRelationTableSpec[];
    readonly entityNameToJoinsMap: {
        [key: string]: EntityJoinSpec[];
    };
    readonly entityNameToIsArrayMap: {
        [key: string]: boolean;
    };
    readonly entityNameToTableNameMap: {
        [key: string]: string;
    };
    getForeignIdFieldName(entityName: string): string;
    getManyToManyRelationTableSpec(associationTableName: string): ManyToManyRelationTableSpec;
    addEntityNameAndClass(entityName: string, entityClass: Function): void;
    addAdditionalSqlCreateTableStatementOptionsForEntity(entityName: string, additionalSqlCreateTableStatementOptions: string): void;
    addEntityIndex(indexName: string, indexFields: string[]): void;
    addEntityUniqueIndex(indexName: string, indexFields: string[]): void;
    addIndexSortOrder(indexName: string, sortOrder: SortOrder): void;
    addUsingOptionForIndex(indexName: string, usingOption?: string): void;
    addAdditionalSqlCreateIndexStatementOptionsForIndex(indexName: string, additionalSqlCreateIndexStatementOptions?: string): void;
    addEntityAdditionalPropertyName(entityName: string, propertyName: string): void;
    addEntityTableName(entityName: string, tableName: string): void;
    isEntity(Class: Function): boolean;
}
declare const _default: EntityAnnotationContainer;
export default _default;
