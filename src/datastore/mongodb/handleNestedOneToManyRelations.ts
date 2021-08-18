import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import getTypeInfoForTypeName from '../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../utils/type/isEntityTypeName';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import { doesClassPropertyContainCustomValidation } from "../../validation/setClassPropertyValidationDecorators";

export default function handleNestedOneToManyRelations(
  entity: any,
  Types: object,
  EntityClass: new () => any,
  subEntityPath: string
) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
    if (typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, fieldName)) {
      delete entity[fieldName];
    }

    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);
    const fieldPathName = subEntityPath + '.' + fieldName;

    if (
      entity[subEntityPath] !== undefined &&
      entity[subEntityPath].length > 0 &&
      !doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined')
    ) {
      entity[subEntityPath].forEach((subEntity: any) => {
        const arrayIndex = subEntity.id;
        Object.entries(subEntity).forEach(([fieldName, fieldValue]) => {
          if (fieldName !== 'id') {
            entity[`${subEntityPath}.${arrayIndex}.${fieldName}`] = fieldValue;
          }
        });
      });
    }

    if (
      isArrayType &&
      isEntityTypeName(baseTypeName) &&
      !typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, fieldName)
    ) {
      handleNestedOneToManyRelations(entity, Types, (Types as any)[baseTypeName], fieldPathName);
    }

    if (
      (entity[subEntityPath] !== undefined && entity[subEntityPath].length > 0) ||
      doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined')
    ) {
      delete entity[subEntityPath];
    }
  });
}
