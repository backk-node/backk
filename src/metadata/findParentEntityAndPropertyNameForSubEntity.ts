import getClassPropertyNameToPropertyTypeNameMap from './getClassPropertyNameToPropertyTypeNameMap';
import isEntityTypeName from '../utils/type/isEntityTypeName';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';

export default function findParentEntityAndPropertyNameForSubEntity(
  EntityClass: new () => any,
  SubEntityClass: new () => any,
  Types: any
): [Function, string] | undefined {
  const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  const foundPropertyEntry = Object.entries(entityPropertyNameToPropertyTypeNameMap).find(
    ([, propertyTypeName]) =>
      getTypeInfoForTypeName(propertyTypeName).baseTypeName === SubEntityClass.name ||
      Object.entries(entityAnnotationContainer.entityNameToTableNameMap).find(
        ([entityName, tableName]) =>
          getTypeInfoForTypeName(propertyTypeName).baseTypeName === entityName &&
          SubEntityClass.name === tableName
      )
  );

  if (foundPropertyEntry) {
    return [EntityClass, foundPropertyEntry[0]];
  }

  return Object.entries(entityPropertyNameToPropertyTypeNameMap).reduce(
    (foundPropertyName: [Function, string] | undefined, [, propertyTypeName]) => {
      const { baseTypeName } = getTypeInfoForTypeName(propertyTypeName);
      if (isEntityTypeName(baseTypeName)) {
        return (
          foundPropertyName ||
          findParentEntityAndPropertyNameForSubEntity(Types[baseTypeName], SubEntityClass, Types)
        );
      }
      return foundPropertyName;
    },
    undefined
  );
}
