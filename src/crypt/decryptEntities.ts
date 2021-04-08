import decrypt from './decrypt';
import shouldEncryptValue from './shouldEncryptValue';
import getClassPropertyNameToPropertyTypeNameMap from '../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import typePropertyAnnotationContainer from "../decorators/typeproperty/typePropertyAnnotationContainer";

function decryptEntityValues(
  entity: { [key: string]: any },
  EntityClass: new () => any,
  Types: object,
  shouldDecryptManyToMany = true
) {
  if (entity === null) {
    return;
  }

  Object.entries(entity).forEach(([propertyName, propertyValue]) => {
    if (Array.isArray(propertyValue) && propertyValue.length > 0) {
      if (typeof propertyValue[0] === 'object' && propertyValue[0] !== null) {
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
        const isManyToMany = typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, propertyName)

        if ((!isManyToMany || isManyToMany && shouldDecryptManyToMany) && entityMetadata[propertyName]) {
          propertyValue.forEach((pv: any) => {
            decryptEntityValues(
              pv,
              (Types as any)[getTypeInfoForTypeName(entityMetadata[propertyName]).baseTypeName],
              Types,
              shouldDecryptManyToMany
            );
          });
        }

      } else if (shouldEncryptValue(propertyName, EntityClass)) {
        if (typeof propertyValue[0] !== 'string') {
          throw new Error(
            EntityClass.name + '.' + propertyName + ' must be string array in order to encrypt it'
          );
        }
        propertyValue.forEach((_, index) => {
          propertyValue[index] = decrypt(propertyValue[index]);
        });
      }
    } else if (propertyName !== '_id' && typeof propertyValue === 'object' && propertyValue !== null) {
      const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
      if (entityMetadata[propertyName]) {
        decryptEntityValues(
          propertyValue,
          (Types as any)[getTypeInfoForTypeName(entityMetadata[propertyName]).baseTypeName],
          Types,
          shouldDecryptManyToMany
        );
      }
    } else if (
      propertyValue !== null &&
      propertyValue !== undefined &&
      shouldEncryptValue(propertyName, EntityClass)
    ) {
      if (typeof propertyValue !== 'string') {
        throw new Error(EntityClass.name + '.' + propertyName + ' must be string in order to encrypt it');
      }
      entity[propertyName] = decrypt(propertyValue);
    }
  });
}

export default function decryptEntities<T extends { [key: string]: any }>(
  entities: T[],
  EntityClass: new () => T,
  Types: object,
  shouldDecryptManyToMany = true
) {
  entities.forEach((entity) => decryptEntityValues(entity, EntityClass, Types, shouldDecryptManyToMany));
}
