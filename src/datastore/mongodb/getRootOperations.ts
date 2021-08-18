import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import isEntityTypeName from '../../utils/type/isEntityTypeName';
import getTypeInfoForTypeName from '../../utils/type/getTypeInfoForTypeName';

export default function getRootOperations<T extends { subEntityPath?: string }>(
  operations: T[],
  EntityClass: new () => any,
  Types: any,
  subEntityPath = ''
): T[] {
  const entityClassPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  let rootEntityOperations: T[] = [];
  if (subEntityPath === '') {
    rootEntityOperations = operations.filter(
      (operation) => !operation.subEntityPath || operation.subEntityPath === '*'
    );
  }

  const otherRootOperations = Object.entries(entityClassPropertyNameToPropertyTypeNameMap).reduce(
    (otherRootOperations, [propertyName, propertyTypeName]) => {
      const { baseTypeName } = getTypeInfoForTypeName(propertyTypeName);

      if (isEntityTypeName(baseTypeName)) {
        if (!typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, propertyName)) {
          const subSubEntityOperations = getRootOperations(
            operations,
            Types[baseTypeName],
            Types,
            propertyName + '.'
          );

          const subEntityOperations = operations.filter((operation) => {
            const wantedSubEntityPath = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;
            return operation.subEntityPath === wantedSubEntityPath || operation.subEntityPath === '*';
          });

          return [...otherRootOperations, ...subEntityOperations, ...subSubEntityOperations];
        }
      }

      return otherRootOperations;
    },
    [] as T[]
  );

  return [...rootEntityOperations, ...otherRootOperations];
}
