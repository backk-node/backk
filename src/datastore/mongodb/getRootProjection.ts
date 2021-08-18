import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../utils/type/getTypeInfoForTypeName';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import isEntityTypeName from '../../utils/type/isEntityTypeName';
import entityAnnotationContainer from '../../decorators/entity/entityAnnotationContainer';

export default function getRootProjection(
  projection: object,
  EntityClass: new () => any,
  Types: any,
  subEntityPath = ''
): object {
  const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  const rootProjection = Object.entries(entityPropertyNameToPropertyTypeNameMap).reduce(
    (otherRootProjection, [propertyName, propertyTypeName]) => {
      const { baseTypeName } = getTypeInfoForTypeName(propertyTypeName);
      let subEntityProjection = {};
      const fieldPathName = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;

      if (
        isEntityTypeName(baseTypeName) &&
        !typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, propertyName)
      ) {
        const subEntityName = entityAnnotationContainer.entityNameToTableNameMap[baseTypeName];

        if (subEntityName) {
          const subEntityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(
            Types[baseTypeName]
          );

          const areAllSubEntityPropertiesUndefined = Object.keys(subEntityPropertyNameToPropertyTypeNameMap).reduce((areAllSubEntityPropertiesUndefined, subEntityPropertyName) => {
            const subEntityFieldPathName = fieldPathName + '.' + subEntityPropertyName;
            if ((projection as any)[subEntityFieldPathName] !== undefined) {
              return false;
            }
            return areAllSubEntityPropertiesUndefined;
          }, true);

          if (areAllSubEntityPropertiesUndefined) {
            Object.keys(subEntityPropertyNameToPropertyTypeNameMap).forEach((subEntityPropertyName) => {
              const subEntityFieldPathName = fieldPathName + '.' + subEntityPropertyName;
              if ((projection as any)[subEntityFieldPathName] === undefined) {
                (projection as any)[subEntityFieldPathName] = 1;
              }
            });
          }
        }

        subEntityProjection = getRootProjection(projection, Types[baseTypeName], Types, propertyName);
      }

      const entityProjection = Object.entries(projection).reduce(
        (entityProjection, [projectionFieldPathName, shouldIncludeField]) => {
          let newEntityProjection = entityProjection;

          if (projectionFieldPathName === fieldPathName) {
            newEntityProjection = { ...newEntityProjection, [fieldPathName]: shouldIncludeField };
          } else if (
            projectionFieldPathName.length > fieldPathName.length &&
            projectionFieldPathName.startsWith(fieldPathName)
          ) {
            newEntityProjection = { ...newEntityProjection, [fieldPathName]: shouldIncludeField };
          }

          return newEntityProjection;
        },
        {}
      );

      return { ...otherRootProjection, ...entityProjection, ...subEntityProjection };
    },
    {}
  );

  Object.keys(rootProjection).forEach((fieldName) => {
    if (!fieldName.includes('.')) {
      const foundSubFieldName = Object.keys(rootProjection).find((otherFieldName) =>
        otherFieldName.startsWith(fieldName + '.')
      );
      if (foundSubFieldName) {
        delete (rootProjection as any)[fieldName];
      }
    }
  });

  return rootProjection;
}
