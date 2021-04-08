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

class EntityAnnotationContainer {
  readonly entityNameToClassMap: { [key: string]: Function } = {};
  readonly entityNameToAdditionalSqlCreateTableStatementOptionsMap: { [key: string]: string } = {};
  readonly entityNameToForeignIdFieldNamesMap: { [key: string]: string[] } = {};
  readonly indexNameToIndexFieldsMap: { [key: string]: string[] } = {};
  readonly indexNameToUniqueIndexFieldsMap: { [key: string]: string[] } = {};
  readonly indexNameToSortOrderMap: { [key: string]: SortOrder } = {};
  readonly indexNameToUsingOptionMap: { [key: string]: string | undefined } = {};
  readonly indexNameToAdditionalSqlCreateIndexStatementOptionsMap: { [key: string]: string | undefined } = {};
  readonly manyToManyRelationTableSpecs: ManyToManyRelationTableSpec[] = [];
  readonly entityNameToJoinsMap: { [key: string]: EntityJoinSpec[] } = {};
  readonly entityNameToIsArrayMap: { [key: string]: boolean } = {};
  readonly entityNameToTableNameMap: { [key: string]: string } = {}

  getForeignIdFieldName(entityName: string): string {
    return this.entityNameToForeignIdFieldNamesMap[entityName][0];
  }

  getManyToManyRelationTableSpec(associationTableName: string) {
    return this.manyToManyRelationTableSpecs.find(
      (manyToManyRelationTableSpec) =>
        manyToManyRelationTableSpec.associationTableName === associationTableName
    ) as ManyToManyRelationTableSpec;
  }

  addEntityNameAndClass(entityName: string, entityClass: Function) {
    this.entityNameToClassMap[entityName] = entityClass;
  }

  addAdditionalSqlCreateTableStatementOptionsForEntity(
    entityName: string,
    additionalSqlCreateTableStatementOptions: string
  ) {
    this.entityNameToAdditionalSqlCreateTableStatementOptionsMap[
      entityName
    ] = additionalSqlCreateTableStatementOptions;
  }

  addEntityIndex(indexName: string, indexFields: string[]) {
    this.indexNameToIndexFieldsMap[indexName] = indexFields;
  }

  addEntityUniqueIndex(indexName: string, indexFields: string[]) {
    this.indexNameToUniqueIndexFieldsMap[indexName] = indexFields;
  }

  addIndexSortOrder(indexName: string, sortOrder: SortOrder) {
    this.indexNameToSortOrderMap[indexName] = sortOrder;
  }

  addUsingOptionForIndex(indexName: string, usingOption?: string) {
    this.indexNameToUsingOptionMap[indexName] = usingOption;
  }

  addAdditionalSqlCreateIndexStatementOptionsForIndex(
    indexName: string,
    additionalSqlCreateIndexStatementOptions?: string
  ) {
    this.indexNameToAdditionalSqlCreateIndexStatementOptionsMap[
      indexName
    ] = additionalSqlCreateIndexStatementOptions;
  }

  addEntityAdditionalPropertyName(entityName: string, propertyName: string) {
    if (this.entityNameToForeignIdFieldNamesMap[entityName]) {
      this.entityNameToForeignIdFieldNamesMap[entityName].push(propertyName);
    } else {
      this.entityNameToForeignIdFieldNamesMap[entityName] = [propertyName];
    }
  }

  addEntityTableName(entityName: string, tableName: string) {
    this.entityNameToTableNameMap[entityName] = tableName;
  }

  isEntity(Class: Function) {
    let proto = Object.getPrototypeOf(new (Class as new () => any)());
    while (proto !== Object.prototype) {
      if (this.entityNameToClassMap[proto.constructor.name] !== undefined) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }
}

export default new EntityAnnotationContainer();
