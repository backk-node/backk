import AbstractDbManager from '../AbstractDbManager';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../utils/type/isEntityTypeName';
import { doesClassPropertyContainCustomValidation } from '../../validation/setClassPropertyValidationDecorators';
import entityAnnotationContainer, { EntityJoinSpec } from '../../decorators/entity/entityAnnotationContainer';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';

function setJoinSpec(entityName: string, EntityClass: Function, fieldName: string, subEntityName: string) {
  const isReadonly = doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined');

  if (
    isReadonly &&
    typePropertyAnnotationContainer.isTypePropertyOneToMany(EntityClass, fieldName) &&
    typePropertyAnnotationContainer.isTypePropertyExternalServiceEntity(EntityClass, fieldName)
  ) {

    let subEntityTableName = subEntityName.toLowerCase();
    if (entityAnnotationContainer.entityNameToTableNameMap[subEntityName]) {
      subEntityTableName = entityAnnotationContainer.entityNameToTableNameMap[subEntityName].toLowerCase();
    }

    let entityTableName = entityName;
    if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
      entityTableName = entityAnnotationContainer.entityNameToTableNameMap[entityName];
    }

    const subEntityForeignIdFieldName = entityTableName.charAt(0).toLowerCase() + entityTableName.slice(1) + 'Id';

    const entityJoinSpec: EntityJoinSpec = {
      EntityClass,
      isReadonly,
      entityFieldName: fieldName,
      subEntityTableName,
      entityIdFieldName: '_id',
      subEntityForeignIdFieldName,
      asFieldName: fieldName
    };

    if (entityAnnotationContainer.entityNameToJoinsMap[entityName]) {
      entityAnnotationContainer.entityNameToJoinsMap[entityName].push(entityJoinSpec);
    } else {
      entityAnnotationContainer.entityNameToJoinsMap[entityName] = [entityJoinSpec];
    }
  }
}

export default function setJoinSpecs(
  dbManager: AbstractDbManager,
  entityName: string,
  EntityClass: Function
) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);
  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]: [any, any]) => {
    if (typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, fieldName)) {
      return;
    }

    const { baseTypeName } = getTypeInfoForTypeName(fieldTypeName);

    if (isEntityTypeName(baseTypeName)) {
      setJoinSpec(entityName, EntityClass, fieldName, baseTypeName);
    }
  });
}
