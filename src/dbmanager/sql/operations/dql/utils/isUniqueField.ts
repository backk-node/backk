import getClassPropertyNameToPropertyTypeNameMap from '../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import typePropertyAnnotationContainer from '../../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import isEntityTypeName from '../../../../../utils/type/isEntityTypeName';
import getTypeInfoForTypeName from '../../../../../utils/type/getTypeInfoForTypeName';

export default function isUniqueField(
  fieldPathName: string,
  EntityClass: new () => any,
  Types: any,
  fieldPath = ''
): boolean {
  const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  return Object.entries(entityPropertyNameToPropertyTypeNameMap).reduce(
    (isUniqueFieldResult: boolean, [propertyName, propertyTypeName]) => {
      if (
        propertyName === '_id' ||
        propertyName === 'id' ||
        propertyName.endsWith('Id') ||
        (fieldPath + propertyName === fieldPathName &&
          typePropertyAnnotationContainer.isTypePropertyUnique(EntityClass, propertyName))
      ) {
        return true;
      }

      if (isEntityTypeName(propertyTypeName)) {
        const { baseTypeName } = getTypeInfoForTypeName(propertyTypeName);
        return (
          isUniqueFieldResult ||
          isUniqueField(fieldPathName, Types[baseTypeName], Types, fieldPath + propertyName + '.')
        );
      }

      return isUniqueFieldResult;
    },
    false
  );
}
