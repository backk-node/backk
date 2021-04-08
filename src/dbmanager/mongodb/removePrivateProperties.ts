import typePropertyAnnotationContainer from "../../decorators/typeproperty/typePropertyAnnotationContainer";
import getClassPropertyNameToPropertyTypeNameMap
  from "../../metadata/getClassPropertyNameToPropertyTypeNameMap";
import getTypeInfoForTypeName from "../../utils/type/getTypeInfoForTypeName";

function removeEntityPrivateProperties<T>(
  entity: any,
  EntityClass: new () => any,
  Types: object,
  isInternalCall: boolean
) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  Object.entries(entity).forEach(([propertyName, propertyValue]: [string, any]) => {
    if (
      (!isInternalCall && typePropertyAnnotationContainer.isTypePropertyPrivate(EntityClass, propertyName)) ||
      propertyName === 'entityIdFieldNameAsString'
    ) {
      delete entity[propertyName];
      return;
    }

    if (entityMetadata[propertyName]) {
      const { baseTypeName, isArrayType } = getTypeInfoForTypeName(entityMetadata[propertyName]);
      const SubEntityClass = (Types as any)[baseTypeName];

      if (SubEntityClass && propertyValue !== null) {
        if (isArrayType) {
          propertyValue.forEach((subValue: any) => {
            removeEntityPrivateProperties(subValue, SubEntityClass, Types, isInternalCall);
          });
        } else {
          removeEntityPrivateProperties(propertyValue, SubEntityClass, Types, isInternalCall);
        }
      }
    }
  });
}

export default function removePrivateProperties(
  entities: any[],
  EntityClass: new () => any,
  Types: object,
  isInternalCall = false
) {
  entities.forEach((entity) => {
    removeEntityPrivateProperties(entity, EntityClass, Types, isInternalCall);
  });
}
