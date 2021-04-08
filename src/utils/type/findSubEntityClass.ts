import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from './getTypeInfoForTypeName';
import isEntityTypeName from './isEntityTypeName';

export default function findSubEntityClass(
  subEntityPath: string,
  EntityClass: new () => any,
  Types: any,
  currentPath = ''
): (new () => any) | void {
  const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
  let SubEntityClass: (new () => any) | void = undefined;

  Object.entries(entityPropertyNameToPropertyTypeNameMap).forEach(([propertyName, propertyTypeName]) => {
    const propertyPathName = currentPath ? currentPath + '.' + propertyName : propertyName;
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(propertyTypeName);

    if (propertyPathName === subEntityPath) {
      SubEntityClass = Types[baseTypeName];
    }

    if (!SubEntityClass && isArrayType && isEntityTypeName(baseTypeName)) {
      SubEntityClass = findSubEntityClass(subEntityPath, Types[baseTypeName], Types, propertyName);
    }
  });

  return SubEntityClass;
}
